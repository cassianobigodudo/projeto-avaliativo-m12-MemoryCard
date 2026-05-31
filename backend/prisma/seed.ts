import { PrismaClient, Condition, Region } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Dados dos usuários ───────────────────────────────────────────────────────

const users = [
  { name: 'Cassiano Machado', email: 'cassiano@memorycard.com' },
  { name: 'Ana Beatriz',      email: 'ana@memorycard.com' },
  { name: 'Rafael Souza',     email: 'rafael@memorycard.com' },
  { name: 'Juliana Costa',    email: 'juliana@memorycard.com' },
];

// ─── Catálogo de jogos por usuário ───────────────────────────────────────────

type GameSeed = {
  title: string;
  platform: string;
  condition: Condition;
  region: Region;
  notes?: string;
};

const gamesCatalog: Record<string, GameSeed[]> = {
  'cassiano@memorycard.com': [
    { title: 'Super Mario World',         platform: 'Super Nintendo', condition: 'Sealed',        region: 'NTSC',       notes: 'Comprado lacrado em leilão' },
    { title: 'The Legend of Zelda: ALTTP', platform: 'Super Nintendo', condition: 'CompleteInBox', region: 'NTSC',       notes: 'Com caixa e manual originais' },
    { title: 'Donkey Kong Country',        platform: 'Super Nintendo', condition: 'Loose',         region: 'PAL' },
    { title: 'Chrono Trigger',             platform: 'Super Nintendo', condition: 'CompleteInBox', region: 'NTSC',       notes: 'Edição japonesa' },
    { title: 'Final Fantasy VII',          platform: 'PlayStation',    condition: 'CompleteInBox', region: 'NTSC' },
    { title: 'Metal Gear Solid',           platform: 'PlayStation',    condition: 'Sealed',        region: 'NTSC_J',     notes: 'Versão japonesa lacrada' },
    { title: 'Resident Evil 2',            platform: 'PlayStation',    condition: 'Loose',         region: 'NTSC' },
    { title: 'Pokémon Red',                platform: 'Game Boy',       condition: 'Loose',         region: 'NTSC',       notes: 'Bateria ainda funciona' },
  ],

  'ana@memorycard.com': [
    { title: 'Animal Crossing: New Horizons', platform: 'Nintendo Switch', condition: 'Digital',       region: 'RegionFree' },
    { title: 'The Legend of Zelda: BotW',     platform: 'Nintendo Switch', condition: 'CompleteInBox', region: 'RegionFree' },
    { title: 'Stardew Valley',                platform: 'Nintendo Switch', condition: 'Digital',       region: 'RegionFree' },
    { title: 'Hollow Knight',                 platform: 'Nintendo Switch', condition: 'Digital',       region: 'RegionFree' },
    { title: 'Mario Kart 8 Deluxe',           platform: 'Nintendo Switch', condition: 'CompleteInBox', region: 'RegionFree', notes: 'Presente de aniversário' },
    { title: 'Splatoon 3',                    platform: 'Nintendo Switch', condition: 'Sealed',        region: 'RegionFree' },
  ],

  'rafael@memorycard.com': [
    { title: 'God of War',                platform: 'PlayStation 4',  condition: 'CompleteInBox', region: 'NTSC' },
    { title: 'The Last of Us Part II',     platform: 'PlayStation 4',  condition: 'Sealed',        region: 'NTSC',       notes: 'Edição especial' },
    { title: 'Red Dead Redemption 2',      platform: 'PlayStation 4',  condition: 'CompleteInBox', region: 'NTSC' },
    { title: 'Spider-Man',                 platform: 'PlayStation 4',  condition: 'Loose',         region: 'NTSC' },
    { title: 'Bloodborne',                 platform: 'PlayStation 4',  condition: 'CompleteInBox', region: 'NTSC',       notes: 'Comprado usado, ótimo estado' },
    { title: 'Dark Souls III',             platform: 'PlayStation 4',  condition: 'CompleteInBox', region: 'PAL' },
    { title: 'Sekiro: Shadows Die Twice',  platform: 'PlayStation 4',  condition: 'Sealed',        region: 'NTSC' },
    { title: 'Elden Ring',                 platform: 'PlayStation 5',  condition: 'CompleteInBox', region: 'RegionFree' },
    { title: 'Demon\'s Souls Remake',      platform: 'PlayStation 5',  condition: 'Sealed',        region: 'NTSC',       notes: 'Edição de lançamento' },
  ],

  'juliana@memorycard.com': [
    { title: 'Sonic the Hedgehog 2',       platform: 'Mega Drive',     condition: 'CompleteInBox', region: 'PAL',        notes: 'Versão europeia com caixa' },
    { title: 'Streets of Rage 2',          platform: 'Mega Drive',     condition: 'Loose',         region: 'NTSC' },
    { title: 'Mortal Kombat II',           platform: 'Mega Drive',     condition: 'Loose',         region: 'NTSC' },
    { title: 'Pokémon Gold',               platform: 'Game Boy Color', condition: 'CompleteInBox', region: 'NTSC',       notes: 'Com caixa e manual' },
    { title: 'Pokémon Crystal',            platform: 'Game Boy Color', condition: 'Loose',         region: 'NTSC' },
    { title: 'Metroid Fusion',             platform: 'Game Boy Advance', condition: 'CompleteInBox', region: 'NTSC' },
    { title: 'Fire Emblem',                platform: 'Game Boy Advance', condition: 'Sealed',        region: 'NTSC',     notes: 'Raro, lacrado' },
    { title: 'Castlevania: Aria of Sorrow', platform: 'Game Boy Advance', condition: 'Loose',       region: 'NTSC' },
  ],
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  const passwordHash = await bcrypt.hash('Senha123', 10);

  for (const userData of users) {
    // Upsert do usuário (evita duplicatas ao rodar o seed mais de uma vez)
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash,
      },
    });

    console.log(`👤 Usuário: ${user.name} (${user.email})`);

    // Apaga jogos existentes do usuário para evitar duplicatas
    await prisma.game.deleteMany({ where: { userId: user.id } });

    // Cria os jogos do usuário
    const games = gamesCatalog[userData.email] ?? [];
    for (const game of games) {
      await prisma.game.create({
        data: {
          userId: user.id,
          title: game.title,
          platform: game.platform,
          condition: game.condition,
          region: game.region,
          notes: game.notes ?? null,
        },
      });
      console.log(`   🎮 ${game.title} (${game.platform}) — ${game.condition}`);
    }

    console.log(`   ✅ ${games.length} jogos adicionados\n`);
  }

  const totalUsers = await prisma.user.count();
  const totalGames = await prisma.game.count();

  console.log('─────────────────────────────────────');
  console.log(`✅ Seed concluído!`);
  console.log(`   👤 ${totalUsers} usuários no banco`);
  console.log(`   🎮 ${totalGames} jogos no banco`);
  console.log('─────────────────────────────────────');
  console.log('\n📋 Credenciais de acesso (todos com senha: Senha123)');
  for (const u of users) {
    console.log(`   ${u.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
