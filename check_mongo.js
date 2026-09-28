import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

async function checkDb() {
  try {
    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");
    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log(`Usuarios encontrados: ${users.length}`);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    
    const tickets = await mongoose.connection.db.collection('tickets').find().toArray();
    console.log(`Tickets encontrados: ${tickets.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error al conectar:", error);
  }
}
checkDb();
