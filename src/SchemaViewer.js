import React from "react";
import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import NormalSchemaRow from "./NormalSchemaRow";
import RefSchemaRow from "./RefSchemaRow";
import "./styles.css";

class SchemaViewer extends React.Component {
  /* creates a SchemaRow based on given schema
     (equivalent to <NormalRow> in react-schema-viewer)
  */
  createNormalRow(schema, isArrayItem = false) {
    return <NormalSchemaRow schema={schema} isArrayItem={isArrayItem} />;
  }

  /* creates a SchemaRow for $ref
   */
  createRefSchemaRow(schema, isArrayItem = false) {
    return <RefSchemaRow schema={schema} isArrayItem={isArrayItem} />;
  }

  /* renders default types
     : string, numeric type, boolean, null
  */
  renderDefault(schema, isArrayItem = false) {
    return this.createNormalRow(schema, isArrayItem);
  }

  /* renders array schema types:
     "array name: []
      + renders item schemas"
  */
  renderArray(schema, isArrayItem = false) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isArrayItem));

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
  renderObject(schema, isArrayItem = false) {
    let rows = [];
    rows.push(this.createNormalRow(schema, isArrayItem));

    Object.entries(schema.properties).forEach(([key, subSchema]) => {
      /* make sure subSchemas have name property
         in case $ref is used within
      */
      if (!("name" in subSchema)) {
        subSchema["name"] = key;
      }
      rows.push(this.renderSchema(subSchema));
    });

    const closeObjectRow = (
      <TableRow>
        <TableCell className="json-data-structure">}</TableCell>
        <TableCell />
        <TableCell />
      </TableRow>
    );
    rows.push(closeObjectRow);
    return rows;
  }

  /* render $ref in collapsed form
     (no dereferencing)
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
  renderSchema(schema, isArrayItem = false) {
    return (
      <TableBody className="tablebody">
        {"$ref" in schema
          ? this.renderRef(schema, isArrayItem)
          : schema.type === "object"
          ? this.renderObject(schema, isArrayItem)
          : schema.type === "array"
          ? this.renderArray(schema, isArrayItem)
          : this.renderDefault(schema, isArrayItem)}
      </TableBody>
    );
  }

  render() {
    const { schema } = this.props;

    return <Table className="schema-viewer">{this.renderSchema(schema)}</Table>;
  }
}

export default SchemaViewer;
