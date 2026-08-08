export const baseurl = "http://localhost:5555/api";
// export const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5555/api";

export const createActiveYearUrl=`${baseurl}/active/year/create`
export const fetchActiveYearUrl=`${baseurl}/active/year/get`
export const editActiveYearUrl=`${baseurl}/active/year/edit`
export const deleteActiveYearUrl=`${baseurl}/active/year/delete`
export const startActiveYearUrl=`${baseurl}/active/year/start/year`
export const endActiveYearUrl=`${baseurl}/active/year/end/year`


export const loginUserUrl=`${baseurl}/user/login`
export const createUserUrl=`${baseurl}/user/create`
export const editUserUrl=`${baseurl}/user/edit`
export const getUserUrl=`${baseurl}/user/get`
export const deleteUserUrl=`${baseurl}/user/delete`
export const movetoCurrentYearUrl=`${baseurl}/user/move/current/commitee`
export const updatePasswordUrl=`${baseurl}/user/change-password/verify-user`
export const requestUpdatePasswordUrl=`${baseurl}/user/change-password`
export const verifyOtpUrl=`${baseurl}/user/otp/verify`


export const createStockItemUrl=`${baseurl}/item/create`
export const editStockItemUrl=`${baseurl}/item/edit`
export const getStockItemUrl=`${baseurl}/item/get`
export const deleteStockItemUrl=`${baseurl}/item/delete`


export const createLedgerCategoryUrl=`${baseurl}/payment/category/create`
export const editLedgerCategoryUrl=`${baseurl}/payment/category/edit`
export const getLedgerCategoryUrl=`${baseurl}/payment/category/get`
export const deleteLedgerCategoryUrl=`${baseurl}/payment/category/delete`


export const createLedgerPaymentUrl=`${baseurl}/payment/ledger/create`
export const editLedgerPaymentUrl=`${baseurl}/payment/ledger/edit`
export const getLedgerPaymentUrl=`${baseurl}/payment/ledger/get`
export const deleteLedgerPaymentUrl=`${baseurl}/payment/ledger/delete`


export const createLowStockUrl=`${baseurl}/lost/stock/create`
export const editLowStockUrl=`${baseurl}/lost/stock/edit`
export const getLowStockUrl=`${baseurl}/lost/stock/get`
export const deleteLowStockUrl=`${baseurl}/lost/stock/delete`


export const createProgramUrl=`${baseurl}/program/create`
export const editProgramUrl=`${baseurl}/program/edit`
export const getProgramUrl=`${baseurl}/program/get`
export const deleteProgramUrl=`${baseurl}/program/delete`


export const createSahachariItemsUrl=`${baseurl}/sahachari/item/create`
export const editSahachariItemsUrl=`${baseurl}/sahachari/item/edit`
export const getSahachariItemsUrl=`${baseurl}/sahachari/item/get`
export const deleteSahachariItemsUrl=`${baseurl}/sahachari/item/delete`


export const createSahachariUsersUrl=`${baseurl}/sahachari/user/create`
export const editSahachariUsersUrl=`${baseurl}/sahachari/user/edit`
export const getSahachariUsersUrl=`${baseurl}/sahachari/user/get`
export const deleteSahachariUsersUrl=`${baseurl}/sahachari/user/delete`


export const createSahachariIssueUrl=`${baseurl}/sahachari/issues/create`
export const getSahachariIssueUrl=`${baseurl}/sahachari/issues/get`
export const returnSahachariIssueUrl=`${baseurl}/sahachari/issues/return`


export const createStockUrl=`${baseurl}/stock/create`
export const editStockUrl=`${baseurl}/stock/edit`
export const getStockUrl=`${baseurl}/stock/get`
export const deleteStockUrl=`${baseurl}/stock/delete`



