import { useState, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import classes from "./AuthForm.module.css";
import AuthContext from "../Store/auth-context ";

const AuthForm = () => {
  const history = useHistory();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  // Form submit Handler  : =
  const submitHandler = async (e) => {
    e.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    setIsLoading(true);

    try {
      if (isLogin) {
        // Sending sign-in request
        const response = await fetch(
          "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCwmk-7fdNSVYXEySa2zPCb9gz6XNzzI94",
          {
            method: "POST",
            body: JSON.stringify({
              email: enteredEmail,
              password: enteredPassword,
              returnSecureToken: true,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Sign-in successful
          const data = await response.json();
          const idToken = data.idToken;
          // when user signUp then push that token authCtx login so that new user data get stored .
          authCtx.login(idToken);
          console.log(idToken); // Log the idToken (JWT) in the console

          // Auto logOut : if a user logs into his friends laptop and forgets to logout.
          //When a user logs in the token would remain active only for the next 5 minutes.
          setTimeout(() => {
            localStorage.removeItem("token");
            authCtx.logout();
          }, 300000); // 5 minutes in milliseconds
          authCtx.login(true);
          history.push("/profile");
        } else {
          throw new Error("Authentication Failed");
        }
      } else {
        // Sending sign-up request if user does not have account then he need to first create new account :
        const response = await fetch(
          "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCwmk-7fdNSVYXEySa2zPCb9gz6XNzzI94",
          {
            method: "POST",
            body: JSON.stringify({
              email: enteredEmail,
              password: enteredPassword,
              returnSecureToken: true,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Handle successful sign-up
          const data = await response.json();
          console.log(data);
          authCtx.login(data.idToken);
          history.replace("/");
          console.log(data.idToken);
        } else {
          // Sign-up failed
          const errorData = await response.json();
          let errorMessage = "Authentication Failed";

          // To show full wrror if there is error ...
          if (errorData && errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }

          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      // Catch and handle any errors
      console.log(error);
      alert(error.message);
    }

    setIsLoading(false);
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p>Sending request...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};
export default AuthForm;
