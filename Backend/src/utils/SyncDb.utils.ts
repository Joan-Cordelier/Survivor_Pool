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
import fs from 'fs/promises';
import path from 'path';

const FAILED_QUEUE_PATH = path.resolve(process.cwd(), 'failed_sync_queue.json');

type FailedCall = {
    entity: string;
    action: string;
    data: any;
    failedAt?: string;
    error?: any;
};

async function enqueueFailedCall(entry: FailedCall) {
    try {
        let queue: FailedCall[] = [];
        try {
            const raw = await fs.readFile(FAILED_QUEUE_PATH, 'utf8');
            queue = JSON.parse(raw) as FailedCall[];
        } catch (e) {
            // file might not exist or be empty - start with empty queue
            queue = [];
        }
        entry.failedAt = new Date().toISOString();
        queue.push(entry);
        await fs.writeFile(FAILED_QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf8');
        console.log('Enqueued failed sync call for', entry.entity);
    } catch (err) {
        console.error('Failed to enqueue failed sync call:', err);
    }
}

async function retryFailedSyncs() {
    try {
        let queue: FailedCall[] = [];
        try {
            const raw = await fs.readFile(FAILED_QUEUE_PATH, 'utf8');
            queue = JSON.parse(raw) as FailedCall[];
        } catch (e) {
            // nothing to retry
            return;
        }

        const remaining: FailedCall[] = [];

        for (const entry of queue) {
            try {
                switch (entry.entity) {
                    case 'event':
                        await createEvent(
                            entry.data.name,
                            entry.data.id,
                            entry.data.dates,
                            entry.data.location,
                            entry.data.description,
                            entry.data.event_type,
                            entry.data.target_audience,
                            entry.data.image
                        );
                        break;
                    case 'founder':
                        await createFounder(
                            entry.data.name,
                            entry.data.startup_id,
                            entry.data.id,
                            entry.data.image
                        );
                        break;
                    case 'investor':
                        await createInvestor(
                            entry.data.name,
                            entry.data.email,
                            entry.data.id,
                            entry.data.legal_status,
                            entry.data.address,
                            entry.data.phone,
                            entry.data.created_at,
                            entry.data.description,
                            entry.data.investor_type,
                            entry.data.investment_focus
                        );
                        break;
                    case 'news':
                        await createNews(
                            entry.data.title,
                            entry.data.description,
                            entry.data.id,
                            entry.data.news_date,
                            entry.data.location,
                            entry.data.category,
                            entry.data.startup_id,
                            entry.data.image
                        );
                        break;
                    case 'partner':
                        await createPartner(
                            entry.data.name,
                            entry.data.email,
                            entry.data.id,
                            entry.data.legal_status,
                            entry.data.address,
                            entry.data.phone,
                            entry.data.created_at,
                            entry.data.description,
                            entry.data.partnership_type
                        );
                        break;
                    case 'startup':
                        await createStartup(
                            entry.data.name,
                            entry.data.email,
                            entry.data.id,
                            entry.data.legal_status,
                            entry.data.address,
                            entry.data.phone,
                            entry.data.created_at,
                            entry.data.description,
                            entry.data.website_url,
                            entry.data.social_media_url,
                            entry.data.project_status,
                            entry.data.needs,
                            entry.data.sector,
                            entry.data.maturity
                        );
                        if (entry.data.founders && Array.isArray(entry.data.founders)) {
                            for (const f of entry.data.founders) {
                                try {
                                    await createFounder(f.name, f.startup_id, f.id, f.image);
                                } catch (e) {
                                    // if founder creation fails, push to remaining queue
                                    remaining.push({ entity: 'founder', action: 'create', data: f, error: String(e) });
                                }
                            }
                        }
                        break;
                    case 'user':
                        await createUser(
                            entry.data.email,
                            entry.data.name,
                            entry.data.password,
                            entry.data.role,
                            entry.data.founder_id,
                            entry.data.investor_id,
                            entry.data.image
                        );
                        break;
                    default:
                        console.warn('Unknown queued entity:', entry.entity);
                        remaining.push(entry);
                }
            } catch (err) {
                console.error('Retry failed for', entry.entity, err);
                entry.error = String(err);
                remaining.push(entry);
            }
        }

        // write back remaining items
        if (remaining.length > 0) {
            await fs.writeFile(FAILED_QUEUE_PATH, JSON.stringify(remaining, null, 2), 'utf8');
        } else {
            // remove file if empty
            try {
                await fs.unlink(FAILED_QUEUE_PATH);
            } catch (e) {
                // ignore
            }
        }
        console.log('Retry complete. Remaining failed items:', remaining.length);
    } catch (err) {
        console.error('Error retrying failed syncs:', err);
    }
}

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
                        let image: string | undefined = "";
                        try {
                            image = await EventsApi.getEventImage(event.id);
                        } catch (error) {
                            console.error("Error fetching event image:", error);
                        }
                        const newEvent = await createEvent(
                            detailedEvent.name,
                            detailedEvent.id,
                            detailedEvent.dates,
                            detailedEvent.location,
                            detailedEvent.description,
                            detailedEvent.event_type,
                            detailedEvent.target_audience,
                            image
                        );
                        console.log("Created event: %d", newEvent.id);
                        } catch (error) {
                        console.error("Error creating event:", error);
                        // detailedEvent/image may be out of scope here; persist minimal info so we can retry later
                        await enqueueFailedCall({ entity: 'event', action: 'create', data: {
                            id: event?.id,
                            raw: event
                        }, error: String(error) });
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing events:", error);
    }
}

async function syncFounders(founders: any[], existingFounders: any[]) {
    try {
        const existingIds = existingFounders.map(founder => founder.id);

        if (founders.length > 0) {
            founders.forEach(async (founder) => {
                if (!existingIds.includes(founder.id)) {
                    try {
                        let image: string | undefined = "";
                        try {
                            image = await StartupsApi.getFounderImage(founder.startup_id, founder.id);
                        } catch (error) {
                            console.error("Error fetching founder image:", error);
                        }
                        const newFounder = await createFounder(
                            founder.name,
                            founder.startup_id,
                            founder.id,
                            image
                        );
                        console.log("Created founder: %d", newFounder.id);
                        } catch (error) {
                        console.error("Error creating founder:", error);
                        await enqueueFailedCall({ entity: 'founder', action: 'create', data: founder, error: String(error) });
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
                        await enqueueFailedCall({ entity: 'investor', action: 'create', data: investor, error: String(error) });
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
                    let image: string | undefined = "";
                        try {
                            image = await EventsApi.getEventImage(news.id);
                        } catch (error) {
                            console.error("Error fetching event image:", error);
                        }
                    try {
                        const detailedNews = await NewsApi.getNewsById(news.id);
                        const newNewsItem = await createNews(
                            detailedNews.title,
                            detailedNews.description,
                            detailedNews.id,
                            detailedNews.news_date,
                            detailedNews.location,
                            detailedNews.category,
                            detailedNews.startup_id,
                            image
                        );
                        console.log("Created news: %d", newNewsItem.id);
                    } catch (error) {
                        console.error("Error creating news:", error);
                        // detailedNews might be out of scope; persist minimal info
                        await enqueueFailedCall({ entity: 'news', action: 'create', data: { id: news?.id, raw: news, image }, error: String(error) });
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
                        await enqueueFailedCall({ entity: 'partner', action: 'create', data: partner, error: String(error) });
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
        let existingFounders: any[] = [];
        try {
            startups = await StartupsApi.getStartups();
        } catch (error) {
            console.error("Error fetching startups:", error);
        }
        try {
            existingFounders = await getAllFounders();
        } catch (error) {
            console.error("Error fetching founders:", error);
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
                            await syncFounders(detailedStartup.founders, existingFounders);
                        }
                        console.log("Created startup: %d", newStartup.id);
                    } catch (error) {
                        console.error("Error creating startup:", error);
                        await enqueueFailedCall({ entity: 'startup', action: 'create', data: startup, error: String(error) });
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
                    let image: string | undefined = "";
                    try {
                        image = await UsersApi.getUserImage(user.id);
                    } catch (error) {
                        console.error("Error fetching user image:", error);
                    }
                    const generatedPwd = user.password && user.password.length > 0 ? user.password : `imported_${Math.random().toString(36).slice(2,10)}`;
                    try {
                        const newUser = await createUser(
                            user.email,
                            user.name,
                            generatedPwd,
                            user.role ?? 'default',
                            user.founder_id ?? null,
                            user.investor_id ?? null,
                            image
                        );
                        console.log("Created user: %d, %s", newUser.id, newUser.email);
                    } catch (error: any) {
                        console.error("Error creating user:", error);
                        await enqueueFailedCall({ entity: 'user', action: 'create', data: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            password: generatedPwd,
                            role: user.role ?? 'default',
                            founder_id: user.founder_id ?? null,
                            investor_id: user.investor_id ?? null,
                            image
                        }, error: String(error) });
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
    // attempt to retry any failed create operations persisted during this run
    await retryFailedSyncs();
    } catch (error) {
        console.error("Error syncing DB:", error);
    }
}