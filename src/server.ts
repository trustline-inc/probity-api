import { yellow } from "colors";
import app from "./app";
import config from "./config";

const server = app.listen(config.app.port, () => {
  // tslint:disable-next-line
  console.log(`Server started in ${process.env.NODE_ENV} at ` + yellow(`http://localhost:${config.app.port}`));
});

export default server;