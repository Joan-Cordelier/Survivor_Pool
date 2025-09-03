import UsersApi from "../apis/JebApi/users.api";
import { createUser, getAllUsers } from "../objects/User.object";
import EventsApi from "../apis/JebApi/events.api";
import InvestorsApi from "../apis/JebApi/investors.api";
import NewsApi from "../apis/JebApi/news.api";
import PartnersApi from "../apis/JebApi/partners.api";
import StartupsApi from "../apis/JebApi/startups.api";
import { createEvent, getAllEvents } from "../objects/Event.object";
import { createFounder, getAllFounders } from "../objects/Founder.object";
import { createInvestor, getAllInvestors } from "../objects/Investor.object";
import { createNews, getAllNews } from "../objects/News.object";
import { createPartner, getAllPartners } from "../objects/Partner.object";
import { createStartup, getAllStartups } from "../objects/Startup.object";

async function syncEvents() {
    try {
        let events: any[] = [];
        try {
            events = await EventsApi.getEvents();
        } catch (error) {
            console.error("Error fetching events:", error);
        }

        const existingEvents = await getAllEvents();
        const existingIds = existingEvents.map(event => event.id);

        if (events.length > 0) {
            events.forEach(async (event) => {
                if (!existingIds.includes(event.id)) {
                    try {
                        const detailedEvent = await EventsApi.getEventById(event.id);
                        const newEvent = await createEvent(
                            detailedEvent.name,
                            detailedEvent.id,
                            detailedEvent.dates,
                            detailedEvent.location,
                            detailedEvent.description,
                            detailedEvent.event_type,
                            detailedEvent.target_audience
                        );
                        console.log("Created event: %d", newEvent.id);
                    } catch (error) {
                        console.error("Error creating event:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing events:", error);
    }
}

async function syncFounders(founders: any[]) {
    try {
        const existingFounders = await getAllFounders();
        const existingIds = existingFounders.map(founder => founder.id);

        if (founders.length > 0) {
            founders.forEach(async (founder) => {
                if (!existingIds.includes(founder.id)) {
                    try {
                        const newFounder = await createFounder(
                            founder.name,
                            founder.startup_id,
                            founder.id
                        );
                        console.log("Created founder: %d", newFounder.id);
                    } catch (error) {
                        console.error("Error creating founder:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing founders:", error);
    }
}

async function syncInvestors() {
    try {
        let investors: any[] = [];
        try {
            investors = await InvestorsApi.getInvestors();
        } catch (error) {
            console.error("Error fetching investors:", error);
        }

        const existingInvestors = await getAllInvestors();
        const existingIds = existingInvestors.map(investor => investor.id);

        if (investors.length > 0) {
            investors.forEach(async (investor) => {
                if (!existingIds.includes(investor.id)) {
                    try {
                        const newInvestor = await createInvestor(
                            investor.name,
                            investor.email,
                            investor.id,
                            investor.legal_status,
                            investor.address,
                            investor.phone,
                            investor.created_at,
                            investor.description,
                            investor.investor_type,
                            investor.investment_focus
                        );
                        console.log("Created investor: %d", newInvestor.id);
                    } catch (error) {
                        console.error("Error creating investor:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing investors:", error);
    }
}

async function syncNews() {
    try {
        let newsList: any[] = [];
        try {
            newsList = await NewsApi.getNews();
        } catch (error) {
            console.error("Error fetching news:", error);
        }

        const existingNews = await getAllNews();
        const existingIds = existingNews.map(news => news.id);

        if (newsList.length > 0) {
            newsList.forEach(async (news) => {
                if (!existingIds.includes(news.id)) {
                    try {
                        const detailedNews = await NewsApi.getNewsById(news.id);
                        const newNewsItem = await createNews(
                            detailedNews.title,
                            detailedNews.description,
                            detailedNews.id,
                            detailedNews.news_date,
                            detailedNews.location,
                            detailedNews.category,
                            detailedNews.startup_id
                        );
                        console.log("Created news: %d", newNewsItem.id);
                    } catch (error) {
                        console.error("Error creating news:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing news:", error);
    }
}

async function syncPartners() {
    try {
        let partners: any[] = [];
        try {
            partners = await PartnersApi.getPartners();
        } catch (error) {
            console.error("Error fetching partners:", error);
        }

        const existingPartners = await getAllPartners();
        const existingIds = existingPartners.map(partner => partner.id);

        if (partners.length > 0) {
            partners.forEach(async (partner) => {
                if (!existingIds.includes(partner.id)) {
                    try {
                        const newPartner = await createPartner(
                            partner.name,
                            partner.email,
                            partner.id,
                            partner.legal_status,
                            partner.address,
                            partner.phone,
                            partner.created_at,
                            partner.description,
                            partner.partnership_type
                        );
                        console.log("Created partner: %d", newPartner.id);
                    } catch (error) {
                        console.error("Error creating partner:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing partners:", error);
    }
}

async function syncStartups() {
    try {
        let startups: any[] = [];
        try {
            startups = await StartupsApi.getStartups();
        } catch (error) {
            console.error("Error fetching startups:", error);
        }

        const existingStartups = await getAllStartups();
        const existingIds = existingStartups.map(startup => startup.id);

        if (startups.length > 0) {
            startups.forEach(async (startup) => {
                if (!existingIds.includes(startup.id)) {
                    try {
                        const detailedStartup = await StartupsApi.getStartupById(startup.id);
                        const newStartup = await createStartup(
                            detailedStartup.name,
                            detailedStartup.email,
                            detailedStartup.id,
                            detailedStartup.legal_status,
                            detailedStartup.address,
                            detailedStartup.phone,
                            detailedStartup.created_at,
                            detailedStartup.description,
                            detailedStartup.website_url,
                            detailedStartup.social_media_url,
                            detailedStartup.project_status,
                            detailedStartup.needs,
                            detailedStartup.sector,
                            detailedStartup.maturity
                        );
                        if (detailedStartup.founders && detailedStartup.founders.length > 0) {
                            await syncFounders(detailedStartup.founders);
                        }
                        console.log("Created startup: %d", newStartup.id);
                    } catch (error) {
                        console.error("Error creating startup:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing startups:", error);
    }
}

async function syncUsers() {
    try {
        // Fetch users from external API
        let users: any[] = [];
        try {
            users = await UsersApi.getUsers();
        } catch (error: any) {
            console.error("Error fetching users:", error);
        }

        //existing users
        const existingUsers = await getAllUsers();
        //compare users with our DB
        const existingIds = existingUsers.map(user => user.id);
        //Create missing users
        if (users.length > 0) {
            users.forEach(async (user) => {
                if (!existingIds.includes(user.id)) {
                    try {
                        const newUser = await createUser(
                            user.email,
                            user.name,
                            "",
                            user.role,
                            user.id,
                            user.founder_id,
                            user.investor_id
                        );
                        console.log("Created user: %d, %s", newUser.id, newUser.email);
                    } catch (error: any) {
                        console.error("Error creating user:", error);
                    }
                }
            });
        }

        //TODO: update users already in DB
    } catch (error) {
        console.error("Error initializing users:", error);
    }
}

export async function syncDB() {
    try {
        await syncEvents();
        await syncInvestors();
        await syncNews();
        await syncPartners();
        await syncStartups();
        await syncUsers();
    } catch (error) {
        console.error("Error syncing DB:", error);
    }
}