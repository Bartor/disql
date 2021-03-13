import { readFile } from "fs/promises";
import { SECRETS_CONFIG_FILE } from "../../configuration";
import { Secrets } from "../model/config";

export const loadSecrets = async (): Promise<Secrets> => {
  return JSON.parse(
    (await readFile(SECRETS_CONFIG_FILE)).toString("utf-8")
  ) as Secrets;
};
