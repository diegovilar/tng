import { Inject, Service } from "angularts.core";

const LOGID = "UIRouterService";

@Service({
    name: "$uirouter",
})
export class UIRouterService {

    private _routing = false;

    constructor(@Inject("$transitions") $transitions: any) {

        $transitions.onStart({}, (transition: any) => {
            console.log(`${LOGID} >> Transition started (${transition.from().name} -> ${transition.to().name})`);
            this._routing = true;
        });
        $transitions.onSuccess({}, (transition: any) => {
            console.log(`${LOGID} >> Transition succeeded (${transition.from().name} -> ${transition.to().name})`);
            this._routing = false;
        });
        $transitions.onError({}, (transition: any) => {
            console.log(`${LOGID} >> Transition error (${transition.from().name} -> ${transition.to().name})`);
            this._routing = false;
        });

    }

    get isRouting(): boolean {

        return this._routing;

    }

}