import logo from './logo.svg';
import './App.css';
import Treeview from './Components/Treeview/Treeview';

function App() {
  return (
    <>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <Treeview />
    </>
  );
}

export default App;
