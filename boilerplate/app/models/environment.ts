import  Api  from "../services/api/api"

/**
 * The environment is a place where services and shared dependencies between
 * models live.  They are made available to every model via dependency injection.
 */
export class Environment {
  constructor() {
    // create each service
    this.api = Api
  }


  /**
   * Our api.
   */
  api: typeof Api
}
