import {Module} from '../../module'
import {ModalServiceDecorator} from './modal-service-decorator'

// export {Modal, ModalOptions} from './modal'
// export {ModalView, ModalBackdrop, ModalViewOptions} from './modal-view'



@Module({
    name: 'tng.ui.bootstrap',
    dependencies: [
        ModalServiceDecorator
    ]
})
export class TngUiBootstrapModule {

}