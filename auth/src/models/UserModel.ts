import mongoose from "mongoose";
import { Password } from "../utils/password";

// An interface that describes the properties
// that are requried to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id=ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// AN OPTION TO OVERRIDE THE JSON METHOD
// userSchema.methods.toJSON = function(){
//   const user = this;
//   const userObject =user.toObject();
//   userObject.id = userObject._id;
//   delete userObject._id;
//   delete userObject.password;
//   delete userObject.__v;
//   return userObject;
// }

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await Password.toHash(user.password);
  }
  next();
});

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };

//TEST THIS LATER, TRY USING THE MONGOOSE DOCUMENTATION TO IMPLEMENT THE RECOMMENDED WAY
// import mongoose from 'mongoose';

// // An interface that describes the properties
// // that are requried to create a new User
// interface UserAttrs {
//   email: string;
//   password: string;
// }

// // An interface that describes the properties
// // that a User Model has
// interface UserModel extends mongoose.Model<IUser> {
//   build(attrs: UserAttrs): IUser;
// }

// // An interface that describes the properties
// // that a User Document has, RECOMMENDED BY mongoose documentation to not extend Document
// interface IUser {
//   email: string;
//   password: string;
//   potato:string;
//   //can add CreatedAt etc...
// }

// const userSchema = new mongoose.Schema<IUser, UserModel>({
//   email: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// });

// userSchema.statics.build = (attrs: UserAttrs) => {
//   return new User(attrs);
// };

// const User = mongoose.model<IUser, UserModel>('User', userSchema);

// export { User };
