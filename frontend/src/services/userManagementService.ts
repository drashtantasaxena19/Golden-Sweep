import { apiRequest } from "./api"

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

const unwrap = <T>(response: T | ApiResponse<T>): T => {
    if (
        response &&
        typeof response === "object" &&
        "data" in response
    ) {
        return (response as ApiResponse<T>).data
    }
    return response as T
}

export interface UserFilterRequest {
    search?: string
    role?: string
    account_status?: string
    email_verified?: boolean
    country?: string
    page?: number
    limit?: number
}

export interface UserStatusUpdateRequest {
    account_status: string
}

export interface UserRoleUpdateRequest {
    role: string
}

export interface WalletAdjustmentRequest {
    amount: number
}

export interface UserSummary {
    id: string
    full_name: string
    email: string
    phone?: string
    role: string
    account_status: string
    email_verified: boolean
    preferred_language?: string
    country?: string
    state?: string
    wallet_balance: number
    wallet_currency: string
    created_at: string
    last_login_at?: string | null
}

export interface UserListResponse {
    total: number
    page: number
    limit: number
    users: UserSummary[]
}

const qs = (f: UserFilterRequest) => {
    const p = new URLSearchParams()
    Object.entries(f).forEach(([k,v])=>{
        if(v!==undefined && v!==null) p.append(k,String(v))
    })
    return p.toString()
}

export const userManagementService = {
    getStatistics: () =>
        apiRequest("/api/admin/users/statistics",{method:"GET"}).then(unwrap),

    getUsers: (filters: UserFilterRequest={}) =>
        apiRequest<UserListResponse|ApiResponse<UserListResponse>>(
            `/api/admin/users?${qs(filters)}`,{method:"GET"}
        ).then(unwrap),

    getUser: (id:string)=>
        apiRequest(`/api/admin/users/${id}`,{method:"GET"}).then(unwrap),

    updateStatus:(id:string,data:UserStatusUpdateRequest)=>
        apiRequest(`/api/admin/users/${id}/status`,{
            method:"PATCH",
            body:JSON.stringify(data),
        }).then(unwrap),

    updateRole:(id:string,data:UserRoleUpdateRequest)=>
        apiRequest(`/api/admin/users/${id}/role`,{
            method:"PATCH",
            body:JSON.stringify(data),
        }).then(unwrap),

    verifyEmail:(id:string)=>
        apiRequest(`/api/admin/users/${id}/verify-email`,{
            method:"PATCH",
        }).then(unwrap),

    creditWallet:(id:string,data:WalletAdjustmentRequest)=>
        apiRequest(`/api/admin/users/${id}/wallet/credit`,{
            method:"POST",
            body:JSON.stringify(data),
        }).then(unwrap),

    debitWallet:(id:string,data:WalletAdjustmentRequest)=>
        apiRequest(`/api/admin/users/${id}/wallet/debit`,{
            method:"POST",
            body:JSON.stringify(data),
        }).then(unwrap),

    setWalletBalance:(id:string,amount:number)=>
        apiRequest(`/api/admin/users/${id}/wallet?amount=${amount}`,{
            method:"PUT",
        }).then(unwrap),

    deleteUser:(id:string)=>
        apiRequest(`/api/admin/users/${id}`,{
            method:"DELETE",
        }).then(unwrap),

    bulkUpdateStatus:(user_ids:string[],account_status:string)=>
        apiRequest(`/api/admin/users/bulk/status`,{
            method:"PATCH",
            body:JSON.stringify({user_ids,account_status}),
        }).then(unwrap),

    bulkDelete:(user_ids:string[])=>
        apiRequest(`/api/admin/users/bulk`,{
            method:"DELETE",
            body:JSON.stringify(user_ids),
        }).then(unwrap),

    getRecentUsers:(limit=10)=>
        apiRequest(`/api/admin/users/recent/list?limit=${limit}`,{
            method:"GET",
        }).then(unwrap),

    searchByName:(name:string)=>
        apiRequest(`/api/admin/users/search/name?name=${encodeURIComponent(name)}`,{
            method:"GET",
        }).then(unwrap),

    searchByEmail:(email:string)=>
        apiRequest(`/api/admin/users/search/email?email=${encodeURIComponent(email)}`,{
            method:"GET",
        }).then(unwrap),

    getCountries:()=>
        apiRequest(`/api/admin/users/countries`,{method:"GET"}).then(unwrap),

    getRoleCounts:()=>
        apiRequest(`/api/admin/users/roles/count`,{method:"GET"}).then(unwrap),

    getStatusCounts:()=>
        apiRequest(`/api/admin/users/status/count`,{method:"GET"}).then(unwrap),
}

export default userManagementService