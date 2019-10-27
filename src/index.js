import React from "react";
import ReactDOM from "react-dom";
import SchemaViewer from "./SchemaViewer";
import "./styles.css";

function App() {
  const example = "./schemas/example.json";
  const defaultDataType = "./schemas/data-types/default-data-type.json";
  const arrayTypeList = "./schemas/data-types/array-type-list-validation.json";
  const arrayTypeTuple =
    "./schemas/data-types/array-type-tuple-validation.json";
  const arrayTypeComplex =
    "./schemas/data-types/array-type-complex-example.json";
  const objectType = "./schemas/data-types/object-type.json";
  const refSchema = "./schemas/data-types/ref-schema.json";
  const refCircularReference =
    "./schemas/data-types/ref-circular-reference.json";

  return (
    <div>
      <h3>Example Schema</h3>
      {View(example)}
      <h3>Specifications (for schema types)</h3>
      <h4>(1) Default Schema</h4>
      {View(defaultDataType)}
      <h4>(2) Array Schema</h4>
      <h5>(2-1) list validation</h5>
      {View(arrayTypeList)}
      <h5>(2-2) tuple validation</h5>
      {View(arrayTypeTuple)}
      <h5>(2-3) complicated array schema</h5>
      {View(arrayTypeComplex)}
      <h4>(3) Object Schema</h4>
      {View(objectType)}
      <h4>(4) Ref Schema</h4>
      <h5>(4-1) expand or shrink &#36;ref</h5>
      {View(refSchema)}
      <h5>(4-2) circular reference (dereference $ref one level at a time)</h5>
      {View(refCircularReference)}
    </div>
  );
}

function View(uri) {
  const schema = require(`${uri}`);
  return <SchemaViewer schema={schema} schemaSource={uri} />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
