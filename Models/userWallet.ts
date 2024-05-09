import mongoose, {Schema} from "mongoose";

interface IUserWallet extends mongoose.Document{
    telegramId: number;
    mne?: string;
    pass?: string;
    amount?: number;
    address: string;
    memo: string;
    createDate: Date;
}
const UserWalletSchema=new Schema<IUserWallet>({
    telegramId: {
        type: Number,
        required: true,
        unique: true,
    },
    mne:String,
    pass:String,
    amount:Number,
    address:String,
    memo:String,
    createDate:Date
})
export default mongoose.model<IUserWallet>("UserWallet", UserWalletSchema);