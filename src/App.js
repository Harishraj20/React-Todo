import "./Styles/App.css";
import React from "react";
import Todo from "./Components/Todo";
import "./fontAwesomeConfig";



class App extends React.Component {
  state = { color: "black" };
  render() {
    console.log("Parent component updated");
    return <Todo />;
  }
}
export default App;
