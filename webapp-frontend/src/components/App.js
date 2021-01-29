import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Signup from "./Signup";
import Homepage from "./Homepage";


function App() {
  return (
      <div className="App">
          <Router>
              <AuthProvider>
                  <Switch>
                      <ProtectedRoute exact path="/" component={Homepage} />
                      <Route path="/signup" component={Signup} />
                      <Route path="/login" component={Login} />
                  </Switch>
              </AuthProvider>
          </Router>
    </div>
  );
}

export default App;
