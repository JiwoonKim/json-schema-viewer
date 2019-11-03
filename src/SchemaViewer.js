import React from "react";
import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import NormalSchemaRow from "./NormalSchemaRow";
import RefSchemaRow from "./RefSchemaRow";
import "./styles.css";

class SchemaViewer extends React.Component {
  /* creates a SchemaRow based on given schema
     (equivalent to <NormalRow> in react-schema-viewer)
  */
  createNormalRow(schema, indent) {
    return <NormalSchemaRow schema={schema} indent={indent} />;
  }

  /* creates a SchemaRow for $ref
   */
  createRefSchemaRow(schema, indent) {
    return <RefSchemaRow schema={schema} indent={indent} />;
  }

  /* renders default types
     : string, numeric type, boolean, null
  */
  renderDefault(schema, indent) {
    return this.createNormalRow(schema, indent);
  }

  /* renders array schema types:
     "array name: [ item schemas ]"
  */
  renderArray(schema, indent) {
    let rows = [];
    rows.push(this.createNormalRow(schema, indent));

    // list validation: single schema for all items
    if (!Array.isArray(schema.items)) {
      rows.push(this.renderSchema(schema.items, indent + 1));
    }
    // tuple validation: different schemas in certain order
    else {
      schema.items.forEach(itemSchema => {
        rows.push(this.renderSchema(itemSchema, indent + 1));
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
  renderObject(schema, indent) {
    let rows = [];
    rows.push(this.createNormalRow(schema, indent));

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, subSchema]) => {
        /* make sure subSchemas have name property
         in case $ref is used within
        */
        if (!("name" in subSchema)) {
          subSchema["name"] = key;
        }
        rows.push(this.renderSchema(subSchema, indent + 1));
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
     (no dereferencing)
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

  /* render combination of schemas
     : anyOf, oneOf, allOf
  */
  renderCombination(schema, indent) {
    let combMetaData;
    if ("anyOf" in schema) {
      combMetaData = {
        combType: "anyOf",
        combSign: "// Any of",
        parsingWord: "// or"
      };
    } else if ("oneOf" in schema) {
      combMetaData = {
        combType: "oneOf",
        combSign: "// One of",
        parsingWord: "// or"
      };
    } else {
      combMetaData = {
        combType: "allOf",
        combSign: "// All of",
        parsingWord: "// and"
      };
    }

    let { combType, combSign, parsingWord, description } = combMetaData;

    let rows = [];
    const startCombRow = (
      <TableRow>
        <TableCell className="json-data-structure">
          <span className="json-indentation">{"      ".repeat(indent)}</span>
          <span>{combSign}</span>
        </TableCell>
        <TableCell className="info-meta">
          <span>{description}</span>
        </TableCell>
        <TableCell className="info-description" />
      </TableRow>
    );
    rows.push(startCombRow);

    const middleParseRow = (
      <TableRow>
        <TableCell className="json-data-structure">
          <span className="json-indentation">{"      ".repeat(indent)}</span>
          <span>{parsingWord}</span>
        </TableCell>
        <TableCell className="info-meta" />
        <TableCell className="info-description" />
      </TableRow>
    );

    schema[combType].forEach((subSchema, index) => {
      if (index > 0) {
        rows.push(middleParseRow);
      }
      rows.push(this.renderSchema(subSchema, indent));
    });

    return rows;
  }

  /* render the given schema
     according to its type
  */
  renderSchema(schema, indent) {
    let callMethod =
      "anyOf" in schema || "allOf" in schema || "oneOf" in schema
        ? this.renderCombination(schema, indent)
        : "$ref" in schema
        ? this.renderRef(schema, indent)
        : schema.type === "object"
        ? this.renderObject(schema, indent)
        : schema.type === "array"
        ? this.renderArray(schema, indent)
        : this.renderDefault(schema, indent);

    return callMethod;
  }

  render() {
    const { schema } = this.props;

    return (
      <Table className="schema-viewer">
        <TableBody>{this.renderSchema(schema, 0)}</TableBody>
      </Table>
    );
  }
}

export default SchemaViewer;
