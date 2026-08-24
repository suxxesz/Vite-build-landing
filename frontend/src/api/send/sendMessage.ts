import { Fields } from '@/types/form/field.types';
import ApiData from '@/config'

// Раньше URL был захардкожен как http://localhost:3001 — работает только
// локально. В проде фронтенд и бэкенд обычно живут на разных origin/портах,
// поэтому адрес должен приходить из переменной окружения сборки.
// Vite подставляет её на этапе build; см. frontend/.env.example.
const BOT_API_URL = ApiData.API_URL

const sendMessage = async (fields: Fields) => {

    const response = await fetch(

        `${BOT_API_URL}/api/message`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(fields)

        }

    );

    // Раньше здесь сразу делали response.json() и возвращали тело, а вызывающий
    // код (useForm.ts) проверял response.ok — но .ok это поле объекта Response,
    // а не тела ответа, поэтому проверка всегда была ложной (даже при успехе).
    // Теперь проверяем именно Response и бросаем ошибку при неуспехе, чтобы
    // сработал существующий try/catch в onSubmit.
    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? 'Failed to send message');
    }

    return response.json();
};

export default sendMessage;