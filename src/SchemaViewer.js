import React from "react";
import { Table, TableRow, TableCell } from "@material-ui/core";
import NormalSchemaRow from "./NormalSchemaRow";
import RefSchemaRow from "./RefSchemaRow";
import "./styles.css";

class SchemaViewer extends React.Component {
  /* creates a SchemaRow based on given schema
     (equivalent to <NormalRow> in react-schema-viewer)
  */
  createNormalRow(schema) {
    return <NormalSchemaRow schema={schema} />;
  }

  /* creates a SchemaRow for $ref
   */
  createRefSchemaRow(schema) {
    return <RefSchemaRow schema={schema} />;
  }

  /* renders default types
     : string, numeric type, boolean, null
  */
  renderDefault(schema) {
    return this.createNormalRow(schema);
  }

  /* renders array schema types:
     "array name: [ item schemas ]"
  */
  renderArray(schema) {
    let rows = [];
    rows.push(this.createNormalRow(schema));

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
  renderObject(schema) {
    let rows = [];
    rows.push(this.createNormalRow(schema));

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
     (no dereferencing)
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

  /* render combination of schemas
     : anyOf, oneOf, allOf
  */
  renderCombination(schema) {
    let combMetaData;
    if ("anyOf" in schema) {
      combMetaData = {
        combType: "anyOf",
        combSign: "// Any of",
        parsingWord: "// or",
        description: "Data can be any of the following"
      };
    } else if ("oneOf" in schema) {
      combMetaData = {
        combType: "oneOf",
        combSign: "// One of",
        parsingWord: "// or",
        description: "Data should be one of the following (only one)"
      };
    } else {
      combMetaData = {
        combType: "allOf",
        combSign: "// All of",
        parsingWord: "// and",
        description: "Data should satisfy all of the following"
      };
    }

    let { combType, combSign, parsingWord, description } = combMetaData;

    let rows = [];
    const startCombRow = (
      <TableRow>
        <TableCell className="json-data-structure">{combSign}</TableCell>
        <TableCell className="info-meta">{description}</TableCell>
        <TableCell className="info-description" />
      </TableRow>
    );
    rows.push(startCombRow);

    const middleParseRow = (
      <TableRow>
        <TableCell className="json-data-structure">{parsingWord}</TableCell>
        <TableCell className="info-meta" />
        <TableCell className="info-description" />
      </TableRow>
    );

    schema[combType].forEach((subSchema, index) => {
      if (index > 0) {
        rows.push(middleParseRow);
      }
      rows.push(this.renderSchema(subSchema));
    });

    return rows;
  }

  /* render the given schema
     according to its type
  */
  renderSchema(schema) {
    let callMethod =
      "anyOf" in schema || "allOf" in schema || "oneOf" in schema
        ? this.renderCombination(schema)
        : "$ref" in schema
        ? this.renderRef(schema)
        : schema.type === "object"
        ? this.renderObject(schema)
        : schema.type === "array"
        ? this.renderArray(schema)
        : this.renderDefault(schema);

    return callMethod;
  }

  render() {
    const { schema } = this.props;

    return <Table className="schema-viewer">{this.renderSchema(schema)}</Table>;
  }
}

export default SchemaViewer;
