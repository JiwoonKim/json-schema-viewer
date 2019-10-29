import React from "react";
import { TableRow, TableCell } from "@material-ui/core";
import RemoveCircleRoundedIcon from "@material-ui/icons/RemoveCircleRounded";
import "./styles.css";

/* creates a single row based on given schema
   (equivalent to <NormalRow> in react-schema-viewer)
*/
class NormalSchemaRow extends React.Component {
  render() {
    const { schema, isTopRowDereference, handleRefToggle } = this.props;
    const hasName = schema.name ? schema.name : "";
    var dataSign, type;

    switch (schema.type) {
      case "object":
        dataSign = "{";
        type = "Object of";
        break;
      case "array":
        dataSign = "[";
        type = "Array of";
        break;
      default:
        dataSign = `"..."`;
        type = schema.type;
    }

    return (
      <TableRow className="table-row">
        <TableCell className="json-data-structure">
          {hasName && <span>{schema.name} : </span>}
          {dataSign}
          {isTopRowDereference && (
            <button className="ref-click" onClick={handleRefToggle}>
              <RemoveCircleRoundedIcon fontSize="small" />
            </button>
          )}
        </TableCell>
        <TableCell className="info-meta">
          <p>{schema.title}</p>
          <p>({type})</p>
        </TableCell>
        <TableCell className="info-description">{schema.description}</TableCell>
      </TableRow>
    );
  }
}

export default NormalSchemaRow;
