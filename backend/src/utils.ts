export function removeJsonBraces(json: string) {
    return json.replace(/^```json\n/, '').replace(/```/g, '');
}

export function getGeminiText({response, removeJson = false}: {response: any, removeJson?: boolean}) {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ';
    return removeJson ? removeJsonBraces(text) : text;
}

export function getFormattedMessages(messages: any[]): string {
    return messages
        .filter(msg => !msg.hidden) // Игнорируем скрытые сообщения
        .map(msg => `${msg.role === 'user' ? 'Риелтор' : 'Клиент'}: ${msg.content}`)
        .join('\n');
}