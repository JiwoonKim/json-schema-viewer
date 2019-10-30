import React from "react";
import ReactDOM from "react-dom";
import SchemaViewer from "./SchemaViewer";
import "./styles.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewer: "example"
    };
  }

  handleToggle(e) {
    this.setState({
      viewer: e.target.value
    });
  }

  view(uri) {
    const schema = require(`${uri}`);
    return <SchemaViewer schema={schema} schemaSource={uri} />;
  }

  renderExampleSchema() {
    const example = "./schemas/example.json";
    return (
      <div>
        <h3> Example Schema </h3>
        <p>actual JSON example used in Taskcluster (Auth - List Clients)</p>
        {this.view(example)}
      </div>
    );
  }

  renderDefaultDataType() {
    const defaultDataType = "./schemas/data-types/default-data-type.json";
    return (
      <div>
        <h3> Default Data Type </h3>
        <p>string, number, integer, boolean, null</p>
        {this.view(defaultDataType)}
      </div>
    );
  }

  renderArrayTypes = () => {
    const arrayTypeList =
      "./schemas/data-types/array-type-list-validation.json";
    const arrayTypeTuple =
      "./schemas/data-types/array-type-tuple-validation.json";
    const arrayTypeComplex =
      "./schemas/data-types/array-type-complex-example.json";

    return (
      <div>
        <h3> Array Types </h3>
        <p>uses &#91; &#93; to indicate array item types</p>
        {this.view(arrayTypeComplex)}
        <h3>(1) list validation</h3>
        <p>list validation schemas are displayed</p>
        {this.view(arrayTypeList)}
        <h3>(2) tuple validation</h3>
        <p>tuple validation schemas are displayed</p>
        {this.view(arrayTypeTuple)}
      </div>
    );
  };

  renderObjectType = () => {
    const objectType = "./schemas/data-types/object-type.json";
    return (
      <div>
        <h3>Object Type</h3>
        <p>depicts nested structure using &#123; &#125; </p>
        {this.view(objectType)}
      </div>
    );
  };

  renderRefType = () => {
    const refSchema = "./schemas/data-types/ref-schema.json";
    const refCircularReference =
      "./schemas/data-types/ref-circular-reference.json";
    return (
      <div>
        <h3> Ref Types </h3>
        <p>
          expand or shrink &#36;ref
          <span className="warning">
            {" "}
            (click (+) to expand and (-) to shrink)
          </span>
        </p>
        <p>$ref is dynamically retrieved when expand button is clicked!</p>

        {this.view(refSchema)}
        <h3>Circular References</h3>
        <p>dereference $ref one level at a time</p>
        <p className="warning">not fully implemented YET!</p>
        <p className="warning">
          but can open first $ref and get a taste of how $refs will open only
          one level at a time :)
        </p>
        {this.view(refCircularReference)}
      </div>
    );
  };

  renderCombType = () => {
    const anyOfType = "./schemas/data-types/anyof.json";
    const oneOfType = "./schemas/data-types/oneof.json";
    const allOfType = "./schemas/data-types/allof.json";

    return (
      <div>
        <h3> Combination Schema Types </h3>
        <h3>(1) anyOf</h3>
        <p>uses '// Any of' & '// or' comments</p>
        {this.view(anyOfType)}
        <h3>(2) oneOf</h3>
        <p>uses '// One of' & '// or' comments</p>
        {this.view(oneOfType)}
        <h3>(3) allOf</h3>
        <p>uses '// All of' & '// and' comments</p>
        {this.view(allOfType)}
      </div>
    );
  };

  renderHeader() {
    return (
      <div>
        <h2>JSON Schema Viewer Demo :)</h2>
        <p className="warning">working on adding scrollers to each column</p>
        <p className="warning">
          when finished, indentations for json structure will be implemented
        </p>
        <div className="buttons">
          <button
            className="tab"
            value="example"
            onClick={e => this.handleToggle(e)}
          >
            Example Schema
          </button>
          <button
            className="tab"
            value="default type"
            onClick={e => this.handleToggle(e)}
          >
            Default Types
          </button>
          <button
            className="tab"
            value="array type"
            onClick={e => this.handleToggle(e)}
          >
            Array Types
          </button>
          <button
            className="tab"
            value="object type"
            onClick={e => this.handleToggle(e)}
          >
            Object Types
          </button>
          <button
            className="tab"
            value="ref type"
            onClick={e => this.handleToggle(e)}
          >
            Ref Types
          </button>
          <button
            className="tab"
            value="comb type"
            onClick={e => this.handleToggle(e)}
          >
            Comb Types
          </button>
          <strong>&#8592; click to view specific implementations!</strong>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.state.viewer === "default type"
          ? this.renderDefaultDataType()
          : this.state.viewer === "array type"
          ? this.renderArrayTypes()
          : this.state.viewer === "object type"
          ? this.renderObjectType()
          : this.state.viewer === "ref type"
          ? this.renderRefType()
          : this.state.viewer === "comb type"
          ? this.renderCombType()
          : this.renderExampleSchema()}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
