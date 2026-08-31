import { readFileSync, writeFileSync } from 'node:fs'
import { v2 as cloudinary } from 'cloudinary'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator), line.slice(separator + 1)]
    }),
)

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

const sources = {
  logo: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/05/logo.png',
  heroWashing: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/06/washing-machine-repair-nairobi-kenya.png',
  heroTreadmill: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/06/treadmill-repair-nairobi.png',
  heroFridge: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/06/fridge-freezer-refrigerator-repair-nairobi.png',
  technician: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/06/pic7-225x300.jpeg',
  electrical: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/06/electric-1080584_1920.jpg',
  avatar: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2019/09/user-1633249_1280-150x150.png',
  whatsappIcon: 'https://homeappliancesrepair.co.ke/wp-content/plugins/wpt-whatsapp/assets/images/logo-green-small.png',
  newsWashing: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2021/06/pic7-370x200.jpeg',
  newsRepair: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2019/09/pic3-370x200.jpeg',
  newsTools: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2019/09/pic7-370x200.jpeg',
  newsAppliance: 'https://homeappliancesrepair.co.ke/wp-content/uploads/2019/09/pic4-370x200.jpeg',
  servicesBackground: 'https://homeappliancesrepair.co.ke/wp-content/themes/cooltek/images/resources/ourservice-bg.jpg',
  appointmentBackground: 'https://new.homeappliancesrepair.co.ke/wp-content/uploads/2017/07/appoinment-bg.png',
}

const uploaded = {}
for (const [name, source] of Object.entries(sources)) {
  try {
    const result = await cloudinary.uploader.upload(source, {
      public_id: name,
      folder: 'home-appliances-repair',
      overwrite: true,
      resource_type: 'image',
    })
    uploaded[name] = result.secure_url
    console.log(`Uploaded ${name}`)
  } catch (error) {
    console.warn(`Skipped ${name}: ${error.message}`)
  }
}

writeFileSync('src/assets.json', `${JSON.stringify(uploaded, null, 2)}\n`)
console.log(`Saved ${Object.keys(uploaded).length} Cloudinary URLs to src/assets.json`)
