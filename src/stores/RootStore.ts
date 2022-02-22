import { AccountStore, DappStore, NotificationStore,  HistoryStore, MetaStore} from './index';
import CubensisStore from '@stores/CubensisStore';
import SignerStore from '@stores/SignerStore';

class RootStore {
    public accountStore: AccountStore;
    public dappStore: DappStore;
    public notificationStore: NotificationStore;
    public historyStore: HistoryStore;
    public metaStore: MetaStore;
    public cubensisStore: CubensisStore;
    public signerStore: SignerStore;

    constructor() {
        this.accountStore = new AccountStore(this);
        this.dappStore = new DappStore(this);
        this.notificationStore = new NotificationStore(this);
        this.historyStore = new HistoryStore(this);
        this.metaStore = new MetaStore(this);
        this.cubensisStore = new CubensisStore(this)
        this.signerStore = new SignerStore(this)
    }
}

export { RootStore };
