export * from "./bootstrap";
export * from "./modal";
export * from "./modal-service-decorator";
export * from "./modal-view";

declare module "angular" {
    export namespace ui.bootstrap {
        interface IModalService {
            /**
             * @param {Function} modal
             * @param {ng.IScope|IModalScope} scope
             * @returns {IModalServiceInstance}
             */
            open(modal: Function, scope?: ng.IScope|ng.ui.bootstrap.IModalScope): ng.ui.bootstrap.IModalServiceInstance;
        }
    }
}