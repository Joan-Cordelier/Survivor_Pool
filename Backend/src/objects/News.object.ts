import prisma from "../config/db.config";

export async function createNews(
    title: string,
    description: string,
    news_date?: string,
    location?: string,
    category?: string,
    startup_id?: number,
) {
    try {
        // const UserExist = await prisma.user.findUnique({
        //     where: {
        //         email
        //     }
        // });
        // if (UserExist) {
        //     throw new Error("User already exists");
        // }
        const news = await prisma.newsDetail.create({
            data: {
                news_date,
                location,
                title,
                category,
                startup_id,
                description
            },
        });
        return news;
    } catch (error) {
        throw error;
    }
}

export async function getNewsById(id: number) {
    try {
        const news = await prisma.newsDetail.findUnique({
            where: { id }
        });
        return news;
    } catch (error) {
        throw error;
    }
}

export async function getAllNews() {
    try {
        const all_news = await prisma.newsDetail.findMany();
        return all_news;
    } catch (error) {
        throw error;
    }
}

export async function deleteNews(id: number) {
    try {
        const news = await prisma.newsDetail.delete({
            where: { id },
        });
        return news;
    } catch (error) {
        throw error;
    }
}
