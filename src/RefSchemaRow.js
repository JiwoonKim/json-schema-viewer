import React from "react";
import { TableBody, TableRow, TableCell } from "@material-ui/core";
import NormalSchemaRow from "./NormalSchemaRow";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
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
  createNormalRow(schema, isTopRow, isArrayItem = false) {
    return (
      <NormalSchemaRow
        schema={schema}
        isTopRowDereference={isTopRow}
        isArrayItem={isArrayItem}
        handleRefToggle={this.handleRefToggle}
      />
    );
  }

  /* creates a SchemaRow for $ref
   */
  createRefSchemaRow(schema, isArrayItem = false) {
    return <RefSchemaRow schema={schema} isArrayItem={isArrayItem} />;
  }

  /* renders default types
   : string, numeric type, boolean, null
  */
  renderDefault(schema, isTopRow = false, isArrayItem = false) {
    return this.createNormalRow(schema, isTopRow, isArrayItem);
  }

  /* renders array schema types:
   "array name: []
    + renders item schemas"
  */
  renderArray(schema, isTopRow = false, isArrayItem = false) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isTopRow, isArrayItem));

    // list validation: single schema for all items
    if (!Array.isArray(schema.items)) {
      rows.push(this.renderSchema(schema.items, true));
    }
    // tuple validation: different schemas in certain order
    else {
      schema.items.forEach(itemSchema => {
        rows.push(this.renderSchema(itemSchema, true));
      });
    }
    return rows;
  }

  /* renders object schema types:
   "object name: {
     subschemas nested within
   } "
  */
  renderObject(schema, isTopRow = false, isArrayItem = false) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isTopRow, isArrayItem));

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
        <TableCell className="json-data-structure">}</TableCell>
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
  renderRef(schema, isArrayItem = false) {
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
    return this.createRefSchemaRow(refSchema, isArrayItem);
  }

  /* render the given schema
     according to its type
  */
  renderSchema(schema, isTopRow = false, isArrayItem = false) {
    return (
      <div className="tablebody">
        {"$ref" in schema
          ? this.renderRef(schema, isArrayItem)
          : schema.type === "object"
          ? this.renderObject(schema, isTopRow, isArrayItem)
          : schema.type === "array"
          ? this.renderArray(schema, isTopRow, isArrayItem)
          : this.renderDefault(schema, isTopRow, isArrayItem)}
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
