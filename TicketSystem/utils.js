// Verifica si un usuario es administrador
function isAdmin(member) {
    return member.permissions.has('Administrator');
}

// Busca un canal por ID de manera segura
function getChannelById(guild, channelId) {
    return guild.channels.cache.get(channelId) || null;
}

// Busca una categoría por ID de manera segura
function getCategoryById(guild, categoryId) {
    const channel = guild.channels.cache.get(categoryId);
    return channel && channel.type === 4 ? channel : null; // 4 = Category
}

// Valida si un ID es un número válido de Discord
function isValidId(id) {
    return /^\d{17,20}$/.test(id);
}

export default {
    isAdmin,
    getChannelById,
    getCategoryById,
    isValidId
};