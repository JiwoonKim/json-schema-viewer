import React from "react";
import { TableRow, TableCell } from "@material-ui/core";
import RemoveCircleRoundedIcon from "@material-ui/icons/RemoveCircleRounded";
import "./styles.css";

/* creates a single row based on given schema
   (equivalent to <NormalRow> in react-schema-viewer)
*/
class NormalSchemaRow extends React.Component {
  render() {
    const { schema, indent, isTopRowDereference, handleRefToggle } = this.props;
    const hasName = schema.name ? schema.name : "";

    // configure datatype and sign to display
    var dataSign, type;
    switch (schema.type) {
      case "object":
        dataSign = "{";
        type = "";
        break;
      case "array":
        dataSign = "[";
        type = "";
        break;
      default:
        dataSign = "";
        type = `(${schema.type})`;
    }

    // configure validation keywords
    const validKeywords = [
      "additionalProperties",
      "uniqueItems",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "multipleOf",
      "maximum",
      "minimum"
    ];
    const validationProperties = [];
    validKeywords.forEach(keyword => {
      if (keyword in schema) {
        validationProperties.push(`${keyword}: ${schema[keyword]}`);
      }
    });
    if ("required" in schema) {
      let fields = "";
      schema.required.forEach(field => {
        fields += field + ", ";
      });
      validKeywords.push(`required: ${fields}`);
    }

    // configure indentation level
    const indentation = "      ".repeat(indent);

    return (
      <TableRow className="table-row">
        <TableCell className="json-data-structure">
          <span className="json-indentation">{indentation}</span>
          {hasName && <span>{schema.name} : </span>}
          <span>{dataSign}</span>
          {isTopRowDereference && (
            <button className="ref-click" onClick={handleRefToggle}>
              <RemoveCircleRoundedIcon fontSize="small" />
            </button>
          )}
        </TableCell>
        <TableCell className="info-meta">
          <p>
            <strong>{type}</strong>
          </p>
          {validationProperties.map(keyword => (
            <p>{keyword}</p>
          ))}
        </TableCell>
        <TableCell className="info-description">
          <span>{schema.description}</span>
        </TableCell>
      </TableRow>
    );
  }
}

export default NormalSchemaRow;
