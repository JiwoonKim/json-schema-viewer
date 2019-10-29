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
  createNormalRow(schema, isTopRow) {
    return (
      <NormalSchemaRow
        schema={schema}
        isTopRowDereference={isTopRow}
        handleRefToggle={this.handleRefToggle}
      />
    );
  }

  /* creates a SchemaRow for $ref
   */
  createRefSchemaRow(schema) {
    return <RefSchemaRow schema={schema} />;
  }

  /* renders default types
   : string, numeric type, boolean, null
  */
  renderDefault(schema, isTopRow = false) {
    return this.createNormalRow(schema, isTopRow);
  }

  /* renders array schema types:
   "array name: []
    + renders item schemas"
  */
  renderArray(schema, isTopRow = false) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isTopRow));

    // list validation: single schema for all items
    if (!Array.isArray(schema.items)) {
      rows.push(this.renderSchema(schema.items));
    }
    // tuple validation: different schemas in certain order
    else {
      schema.items.forEach(itemSchema => {
        rows.push(this.renderSchema(itemSchema));
      });
    }

    const closeArrayRow = (
      <TableRow>
        <TableCell className="json-data-structure">&#93;</TableCell>
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
  renderObject(schema, isTopRow = false) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isTopRow));

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, subSchema]) => {
        /* make sure subSchemas have name property
         in case $ref is used within
      */
        if (!("name" in subSchema)) {
          subSchema["name"] = key;
        }
        rows.push(this.renderSchema(subSchema));
      });
    }

    const closeObjectRow = (
      <TableRow>
        <TableCell className="json-data-structure">&#125;</TableCell>
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
  renderRef(schema) {
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
    return this.createRefSchemaRow(refSchema);
  }

  /* render the given schema
     according to its type
  */
  renderSchema(schema, isTopRow = false) {
    return (
      <div className="tablebody">
        {"$ref" in schema
          ? this.renderRef(schema)
          : schema.type === "object"
          ? this.renderObject(schema, isTopRow)
          : schema.type === "array"
          ? this.renderArray(schema, isTopRow)
          : this.renderDefault(schema, isTopRow)}
      </div>
    );
  }

  render() {
    const { schema, isArrayItem } = this.props;
    const hasName = schema.name ? schema.name : "";
    const dataSign = schema.refSign;
    const type = "$ref";

    if (!this.state.isExpanded) {
      return (
        <TableRow>
          <TableCell className="json-data-structure">
            {isArrayItem && <strong className="arrayItem"> &#10551; </strong>}
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

      return <div>{this.renderSchema(refSchema, true)}</div>;
    }
  }
}

export default RefSchemaRow;
