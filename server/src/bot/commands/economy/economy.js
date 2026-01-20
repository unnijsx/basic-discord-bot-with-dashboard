const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const EconomyProfile = require('../../models/EconomyProfile');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Global economy system')
        .addSubcommand(sub =>
            sub.setName('balance')
                .setDescription('Check your or another user\'s balance')
                .addUserOption(opt => opt.setName('user').setDescription('User to check')))
        .addSubcommand(sub =>
            sub.setName('daily')
                .setDescription('Claim your daily reward'))
        .addSubcommand(sub =>
            sub.setName('work')
                .setDescription('Work a shift to earn money'))
        .addSubcommand(sub =>
            sub.setName('beg')
                .setDescription('Beg for scrap change'))
        .addSubcommand(sub =>
            sub.setName('deposit')
                .setDescription('Deposit money to your bank')
                .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to deposit').setRequired(true).setMinValue(1)))
        .addSubcommand(sub =>
            sub.setName('withdraw')
                .setDescription('Withdraw money from your bank')
                .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to withdraw').setRequired(true).setMinValue(1)))
        .addSubcommand(sub =>
            sub.setName('rob')
                .setDescription('Attempt to rob another user')
                .addUserOption(opt => opt.setName('target').setDescription('User to rob').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('leaderboard')
                .setDescription('View the richest users')),

    async execute(interaction) {
        const subdomain = interaction.options.getSubcommand();
        const user = interaction.user;

        let profile = await EconomyProfile.findOne({ userId: user.id });
        if (!profile) {
            profile = new EconomyProfile({ userId: user.id });
            await profile.save();
        }

        // --- SUBCOMMAND HANDLERS ---

        if (subdomain === 'balance') {
            const targetUser = interaction.options.getUser('user') || user;
            let targetProfile = await EconomyProfile.findOne({ userId: targetUser.id });
            if (!targetProfile) targetProfile = { wallet: 0, bank: 0, bankCapacity: 1000 };

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setAuthor({ name: `${targetUser.username}'s Balance`, iconURL: targetUser.displayAvatarURL() })
                .addFields(
                    { name: '👛 Wallet', value: `${targetProfile.wallet.toLocaleString()} 🪙`, inline: true },
                    { name: '🏦 Bank', value: `${targetProfile.bank.toLocaleString()} / ${targetProfile.bankCapacity.toLocaleString()} 🪙`, inline: true },
                    { name: '💰 Total Net Worth', value: `${(targetProfile.wallet + targetProfile.bank).toLocaleString()} 🪙`, inline: false }
                );
            return interaction.reply({ embeds: [embed] });
        }

        else if (subdomain === 'daily') {
            const now = new Date();
            if (profile.cooldowns.daily && now < profile.cooldowns.daily) {
                const diff = profile.cooldowns.daily - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return interaction.reply({ content: `⏳ You can claim your daily in **${hours}h ${minutes}m**!`, ephemeral: true });
            }

            const reward = 5000;
            profile.wallet += reward;
            profile.cooldowns.daily = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            await profile.save();

            return interaction.reply({ content: `✅ **Daily Claimed!** You received **${reward.toLocaleString()} 🪙**.` });
        }

        else if (subdomain === 'work') {
            const now = new Date();
            if (profile.cooldowns.work && now < profile.cooldowns.work) {
                const diff = profile.cooldowns.work - now;
                const minutes = Math.floor(diff / (1000 * 60));
                return interaction.reply({ content: `⏳ You need to rest! Work available again in **${minutes}m**.`, ephemeral: true });
            }

            const earned = Math.floor(Math.random() * 500) + 200; // 200-700
            const jobs = ['Programmer', 'Discord Mod', 'Barista', 'Youtuber', 'Uber Driver', 'Freelancer'];
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            profile.wallet += earned;
            profile.cooldowns.work = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
            await profile.save();

            return interaction.reply({ content: `💼 You worked as a **${job}** and earned **${earned} 🪙**.` });
        }

        else if (subdomain === 'beg') {
            const now = new Date();
            if (profile.cooldowns.beg && now < profile.cooldowns.beg) {
                const diff = profile.cooldowns.beg - now;
                const seconds = Math.floor(diff / 1000);
                return interaction.reply({ content: `⏳ Stop begging! Wait **${seconds}s**.`, ephemeral: true });
            }

            // 40% fail rate
            if (Math.random() < 0.4) {
                profile.cooldowns.beg = new Date(now.getTime() + 3 * 60 * 1000); // 3m cooldown even on fail
                await profile.save();
                return interaction.reply({ content: `😔 **Nobody gave you anything.** Get a job!`, ephemeral: true });
            }

            const earned = Math.floor(Math.random() * 50) + 10; // 10-60
            profile.wallet += earned;
            profile.cooldowns.beg = new Date(now.getTime() + 3 * 60 * 1000); // 3m
            await profile.save();

            const people = ['Elon Musk', 'A kind stranger', 'Your mom', 'Rheox', 'A random ghost'];
            const person = people[Math.floor(Math.random() * people.length)];
            return interaction.reply({ content: `🥺 **${person}** gave you **${earned} 🪙**.` });
        }

        else if (subdomain === 'deposit') {
            const amount = interaction.options.getInteger('amount');
            if (amount > profile.wallet) {
                return interaction.reply({ content: `❌ You only have **${profile.wallet.toLocaleString()} 🪙** in your wallet.`, ephemeral: true });
            }

            const availableSpace = profile.bankCapacity - profile.bank;
            if (availableSpace <= 0) {
                return interaction.reply({ content: `❌ Your bank is full! Capacity: **${profile.bankCapacity.toLocaleString()}**`, ephemeral: true });
            }

            const toDeposit = Math.min(amount, availableSpace);

            profile.wallet -= toDeposit;
            profile.bank += toDeposit;
            await profile.save();

            return interaction.reply({ content: `🏦 Deposited **${toDeposit.toLocaleString()} 🪙** into your bank.` + (toDeposit < amount ? ` (Bank full, returned ${amount - toDeposit})` : '') });
        }

        else if (subdomain === 'withdraw') {
            const amount = interaction.options.getInteger('amount');
            if (amount > profile.bank) {
                return interaction.reply({ content: `❌ You only have **${profile.bank.toLocaleString()} 🪙** in your bank.`, ephemeral: true });
            }

            profile.bank -= amount;
            profile.wallet += amount;
            await profile.save();

            return interaction.reply({ content: `💸 Withdrew **${amount.toLocaleString()} 🪙** from your bank.` });
        }

        else if (subdomain === 'rob') {
            const targetUser = interaction.options.getUser('target');
            if (targetUser.id === user.id) return interaction.reply({ content: "❌ You can't rob yourself.", ephemeral: true });
            if (targetUser.bot) return interaction.reply({ content: "❌ You can't rob boats... I mean bots.", ephemeral: true });

            const now = new Date();
            if (profile.cooldowns.rob && now < profile.cooldowns.rob) {
                const diff = profile.cooldowns.rob - now;
                const minutes = Math.floor(diff / (1000 * 60));
                return interaction.reply({ content: `⏳ You're laying low from the police. Try again in **${minutes}m**.`, ephemeral: true });
            }

            let targetProfile = await EconomyProfile.findOne({ userId: targetUser.id });
            if (!targetProfile || targetProfile.wallet < 100) {
                return interaction.reply({ content: `❌ **${targetUser.username}** is too poor to rob (needs at least 100 🪙 in wallet).`, ephemeral: true });
            }

            if (profile.wallet < 500) {
                return interaction.reply({ content: `❌ You need at least **500 🪙** in your wallet to rob (for bail money/equipment).`, ephemeral: true });
            }

            // 45% fail chance
            if (Math.random() < 0.45) {
                const fine = Math.floor(Math.random() * 500) + 100;
                profile.wallet = Math.max(0, profile.wallet - fine);
                profile.cooldowns.rob = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour jail time
                await profile.save();

                return interaction.reply({ content: `👮 **Busted!** You got caught trying to rob ${targetUser.username} and paid a **${fine} 🪙** fine.` });
            }

            // Success: Steal 20-50% of wallet
            const percent = (Math.random() * 0.3) + 0.2;
            const stoleAmount = Math.floor(targetProfile.wallet * percent);

            targetProfile.wallet -= stoleAmount;
            profile.wallet += stoleAmount;
            profile.cooldowns.rob = new Date(now.getTime() + 15 * 60 * 1000); // 15m cooldown on success

            await Promise.all([profile.save(), targetProfile.save()]);

            return interaction.reply({ content: `💰 **HEIST SUCCESSFUL!** You stole **${stoleAmount.toLocaleString()} 🪙** from ${targetUser.username}!` });
        }

        else if (subdomain === 'leaderboard') {
            const topUsers = await EconomyProfile.find().sort({ bank: -1, wallet: -1 }).limit(10);

            const lbString = topUsers.map((p, i) => {
                const total = p.wallet + p.bank;
                return `**${i + 1}.** <@${p.userId}> • 💰 **${total.toLocaleString()}**`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('🏆 Global Wealth Leaderboard')
                .setColor('#FFD700')
                .setDescription(lbString || 'No data yet.');

            return interaction.reply({ embeds: [embed] });
        }
    }
};
