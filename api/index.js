export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const slug = req.query.server;

    if (!slug) {
        return res.status(400).json({
            error: "Missing server parameter"
        });
    }

    try {
        const first = await fetch(
            "https://mineservers.nl/api.php?page=1"
        );

        const firstData = await first.json();
        const totalPages = firstData.total_pages || 1;

        let server = firstData.servers?.find(
            s => s.slug === slug
        );

        for (let page = 2; page <= totalPages && !server; page++) {
            const response = await fetch(
                `https://mineservers.nl/api.php?page=${page}`
            );

            if (!response.ok) continue;

            const data = await response.json();

            server = data.servers?.find(
                s => s.slug === slug
            );
        }

        if (!server) {
            return res.status(404).json({
                error: "Server not found",
                server: slug
            });
        }

        return res.status(200).json({
            name: server.name,
            slug: server.slug,
            total_votes: server.total_votes,
            alltime_votes: server.alltime_votes
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "MineSERVERS request failed"
        });
    }
}
