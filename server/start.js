import { createApp } from './app.js'
const port=Number(process.env.PORT||3001)
const app=await createApp()
app.listen(port,'127.0.0.1',()=>console.log(`Bhoomera Realty running at http://127.0.0.1:${port}`))
