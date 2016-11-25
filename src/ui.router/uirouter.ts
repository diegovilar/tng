import { Module, injectable } from "angularts.core";

import {UIRouterService} from "./router-service";
import {publishStates} from "./states";
import {registerRoutes} from "./routes";

@Module({
    name: "angularts.ui.router.UIRouter",

    dependencies: [
        "ui.router",
        UIRouterService,
    ],

    // Just to make sure the service is instantiated to track transitions form the start
    run: injectable(["$uirouter"], function(){ /* */
        console.log("ops");
    }),
})
export class UIRouter {

    protected constructor(ngModule: ng.IModule) {

        publishStates(this.constructor, ngModule);
        registerRoutes(this.constructor, ngModule);

    }

}