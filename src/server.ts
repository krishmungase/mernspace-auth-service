import { Config } from "./config";

const welcome = (name: string) => {
  console.log("Welcome ",name,Config.PORT);
}


welcome('Krish');