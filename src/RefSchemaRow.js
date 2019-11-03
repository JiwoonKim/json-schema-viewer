import React from "react";
import { TableRow, TableCell } from "@material-ui/core";
import NormalSchemaRow from "./NormalSchemaRow";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import RemoveCircleRoundedIcon from "@material-ui/icons/RemoveCircleRounded";
import "./styles.css";

/* creates a single row based on given schema
   (equivalent to <NormalRow> in react-schema-viewer)
*/
class RefSchemaRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false
    };
  }

  handleRefToggle = () => {
    console.log(this);
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  };

  /* creates a SchemaRow based on given schema
     (equivalent to <NormalRow> in react-schema-viewer)
  */
  createNormalRow(schema, isTopRow, indent) {
    return (
      <NormalSchemaRow
        schema={schema}
        isTopRowDereference={isTopRow}
        indent={indent}
        handleRefToggle={this.handleRefToggle}
      />
    );
  }

  /* creates a SchemaRow for $ref
   */
  createRefSchemaRow(schema, indent) {
    return <RefSchemaRow schema={schema} indent={indent} />;
  }

  /* renders default types
   : string, numeric type, boolean, null
  */
  renderDefault(schema, isTopRow = false, indent) {
    return this.createNormalRow(schema, isTopRow, indent);
  }

  /* renders array schema types:
   "array name: []
    + renders item schemas"
  */
  renderArray(schema, isTopRow = false, indent) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isTopRow, indent));

    // list validation: single schema for all items
    if (!Array.isArray(schema.items)) {
      rows.push(this.renderSchema(schema.items, false, indent + 1));
    }
    // tuple validation: different schemas in certain order
    else {
      schema.items.forEach(itemSchema => {
        rows.push(this.renderSchema(itemSchema, false, indent + 1));
      });
    }

    const closeArrayRow = (
      <TableRow>
        <TableCell className="json-data-structure">
          <span className="json-indentation">{"      ".repeat(indent)}</span>
          <span>&#93;</span>
        </TableCell>
        <TableCell className="info-meta" />
        <TableCell className="info-description" />
      </TableRow>
    );
    rows.push(closeArrayRow);
    return rows;
  }

  /* renders object schema types:
   "object name: {
     subschemas nested within
   } "
  */
  renderObject(schema, isTopRow = false, indent) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isTopRow, indent));

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, subSchema]) => {
        /* make sure subSchemas have name property
         in case $ref is used within
      */
        if (!("name" in subSchema)) {
          subSchema["name"] = key;
        }
        rows.push(this.renderSchema(subSchema, false, indent + 1));
      });
    }

    const closeObjectRow = (
      <TableRow>
        <TableCell className="json-data-structure">
          <span className="json-indentation">{"      ".repeat(indent)}</span>
          <span>&#125;</span>
        </TableCell>
        <TableCell className="info-meta" />
        <TableCell className="info-description" />
      </TableRow>
    );
    rows.push(closeObjectRow);
    return rows;
  }

  /* render $ref in collapsed form
    (no dereferencing,
    also renderRef does not need  isTopRow parameter)
  */
  renderRef(schema, indent) {
    const refURI = schema["$ref"];
    const parsedURI = refURI.split("/");

    const refSchema = {
      name: schema.name,
      type: "$ref",
      refSign: parsedURI[parsedURI.length - 1],
      description: "Click to expand for details.",
      uri: refURI,
      schemaSource: this.props.schemaSource
    };
    return this.createRefSchemaRow(refSchema, indent);
  }

  /* render the given schema
     according to its type
  */
  renderSchema(schema, isTopRow = false, indent) {
    let callMethod =
      "$ref" in schema
        ? this.renderRef(schema, indent)
        : schema.type === "object"
        ? this.renderObject(schema, isTopRow, indent)
        : schema.type === "array"
        ? this.renderArray(schema, isTopRow, indent)
        : this.renderDefault(schema, isTopRow, indent);

    return callMethod;
  }

  render() {
    const { schema, indent } = this.props;
    const hasName = schema.name ? schema.name : "";
    const dataSign = schema.refSign;
    const type = "$ref";

    const indentation = "      ".repeat(indent);

    if (!this.state.isExpanded) {
      return (
        <TableRow>
          <TableCell className="json-data-structure">
            <span className="json-indentation">{indentation}</span>
            {hasName && <span>{schema.name} : </span>}
            <button className="ref-click" onClick={this.handleRefToggle}>
              <span>{dataSign}</span>
              <AddCircleRoundedIcon fontSize="small" />
            </button>
          </TableCell>
          <TableCell className="info-meta">
            <p>{schema.title}</p>
            <p>({type})</p>
          </TableCell>
          <TableCell className="info-description">
            {schema.description}
          </TableCell>
        </TableRow>
      );
    } else {
      const parsedURI = schema.uri.split("#");
      const refURI = parsedURI[0] === "" ? schema.schemaSource : parsedURI[0];
      const refSchema = require(refURI).definitions[dataSign];
      refSchema.name = schema.name;

      const callMethod = this.renderSchema(refSchema, true, indent);
      return callMethod;
    }
  }
}

export default RefSchemaRow;
