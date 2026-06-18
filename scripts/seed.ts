/**
 * Dev seed: creates 5 charger stations with connectors in Bengaluru so the
 * Flutter app has real data to talk to immediately after switching USE_MOCKS=false.
 *
 * Run: npx ts-node scripts/seed.ts
 * Requires DATABASE_URL in .env
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../src/**/*.entity.ts'],
  synchronize: true,
});

const stations = [
  {
    stationName: 'MG Road Metro Charge',
    operatorName: 'ChargeZone',
    address: 'MG Road, near Metro, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9757,
    longitude: 77.6008,
    openingHours: '24x7',
    parkingAvailable: true,
    status: 'active',
    amenities: ['Restroom', 'Café'],
    connectors: [
      { connectorType: 'GBT', powerOutput: 30, chargerType: 'fast', pricePerUnit: 16, status: 'available' },
    ],
  },
  {
    stationName: 'Indiranagar Fast Charge Hub',
    operatorName: 'Statiq',
    address: '100 Feet Rd, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9784,
    longitude: 77.6408,
    openingHours: '6AM–11PM',
    parkingAvailable: true,
    status: 'active',
    amenities: ['Parking', 'Wi-Fi'],
    connectors: [
      { connectorType: 'CCS2', powerOutput: 60, chargerType: 'fast', pricePerUnit: 18, sessionFee: 20, status: 'available' },
      { connectorType: 'Type2', powerOutput: 22, chargerType: 'slow', pricePerUnit: 14, status: 'available' },
    ],
  },
  {
    stationName: 'Koramangala EV Point',
    operatorName: 'ChargeZone',
    address: '5th Block, Koramangala, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9352,
    longitude: 77.6245,
    openingHours: '8AM–10PM',
    parkingAvailable: false,
    status: 'active',
    amenities: [],
    connectors: [
      { connectorType: 'CCS2', powerOutput: 120, chargerType: 'fast', pricePerUnit: 20, sessionFee: 50, parkingCharges: 30, status: 'busy' },
    ],
  },
  {
    stationName: 'Electronic City Supercharger',
    operatorName: 'Statiq',
    address: 'Phase 1, Electronic City, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.8458,
    longitude: 77.6653,
    openingHours: '24x7',
    parkingAvailable: true,
    status: 'active',
    amenities: ['Restroom', 'Food Court', 'Parking'],
    connectors: [
      { connectorType: 'CCS2', powerOutput: 180, chargerType: 'fast', pricePerUnit: 22, sessionFee: 100, status: 'available' },
      { connectorType: 'CHAdeMO', powerOutput: 50, chargerType: 'fast', pricePerUnit: 18, status: 'available' },
    ],
  },
  {
    stationName: 'Jayanagar Slow Charge Bay',
    operatorName: 'Jio-bp pulse',
    address: '4th Block, Jayanagar, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9305,
    longitude: 77.5836,
    openingHours: '9AM–9PM',
    parkingAvailable: true,
    status: 'active',
    amenities: ['Parking'],
    connectors: [
      { connectorType: 'Type2', powerOutput: 7, chargerType: 'slow', pricePerUnit: 12, status: 'out_of_service' },
    ],
  },
];

async function run() {
  await ds.initialize();
  const stationRepo = ds.getRepository('ChargerStation');
  const connectorRepo = ds.getRepository('ChargerConnector');

  for (const s of stations) {
    const { connectors, ...stationData } = s;
    const saved = await stationRepo.save(stationRepo.create(stationData));
    for (const c of connectors) {
      await connectorRepo.save(connectorRepo.create({ ...c, station: { id: saved.id } }));
    }
    console.log(`✓ ${saved.stationName}`);
  }

  console.log('Seed complete.');
  await ds.destroy();
}

run().catch((e) => { console.error(e); process.exit(1); });
