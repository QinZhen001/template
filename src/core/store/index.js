import {Store} from "./src/store"

export {handleStore} from "./src/init"

// export default function (stores) {
//   const store = Store.getInstance(stores);
//   console.log("99999999999999999999", store)
//   const oba = new Observer()
//   oba.observe(store.viewData, upDateCb)
// };
//
//

export const store = Store.getInstance()


