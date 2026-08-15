import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:5000/api"
})

api.interceptors.request.use((conf) => {
    const token = localStorage.getItem("token")

    // console.log("before token", token)

    if(token) 
        conf.headers.Authorization = `Bearer ${token}`

    // console.log("Auth header: ", conf.headers.Authorization)
    
    return conf
})

export default api