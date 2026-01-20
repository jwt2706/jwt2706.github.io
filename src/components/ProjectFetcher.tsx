import React, { useEffect, useState, useRef } from "react";
import { FaGithub, FaExternalLinkAlt, FaUsers, FaArchive } from "react-icons/fa";
import Logos from "./Logos";

interface Repo {
    id: number;
    name: string;
    html_url: string;
    description: string;
    homepage: string;
    languages_url: string;
    created_at: string;
}

interface Org {
    id: number;
    login: string;
    avatar_url: string;
    url: string;
}

const ProjectFetcher: React.FC = () => {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [languages, setLanguages] = useState<{ [key: number]: string[] }>({});
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        // Fetch personal repos
        const fetchRepos = fetch("https://api.github.com/users/jwt2706/repos")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const filteredRepos = data
                    .filter((repo: Repo) => repo.description && repo.description.includes("[!website]"))
                    .map((repo: Repo) => ({
                        ...repo,
                        description: repo.description.replace("[!website]", "").trim(),
                    }))
                    .sort((a: Repo, b: Repo) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setRepos(filteredRepos);

                filteredRepos.forEach((repo: Repo) => {
                    fetch(repo.languages_url)
                        .then((response) => response.json())
                        .then((langData) => {
                            setLanguages((prev) => ({
                                ...prev,
                                [repo.id]: Object.keys(langData),
                            }));
                        });
                });
            });

        // Fetch organizations
        const fetchOrgs = fetch("https://api.github.com/users/jwt2706/orgs")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setOrgs(data);
            });

        Promise.all([fetchRepos, fetchOrgs])
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col items-center">
            {loading ? (
                <p className="text-blue-500">Loading...</p>
            ) : error ? (
                <div className="text-red-500 text-justify bg-gray-800 bg-opacity-75 p-4 rounded-md">
                    <p className="mb-2">{error}</p>
                    Sorry... There was a problem fetching the repositories or organizations from GitHub. Try refreshing the page or visit my <a href="https://github.com/jwt2706" target="_blank" rel="noopener noreferrer" className="text-green-500 underline">GitHub</a> for more projects.
                </div>
            ) : (
                <>
                    {/* Organizations Section */}
                    <div className="w-full max-w-4xl px-4 mb-8">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FaUsers /> Organisations &amp; Teams</h2>
                        <p className="text-gray-400 mb-4 text-base">OSS collaborations on robotics, admin tools, games and more!</p>
                        {orgs.length === 0 ? (
                            <p className="text-gray-400">No public organizations found.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {orgs.map((org) => (
                                    <a key={org.id} href={org.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white bg-opacity-10 backdrop-blur-lg border border-gray-300 rounded-lg p-4 shadow-md hover:-translate-y-1 hover:scale-105 transition-transform duration-300 ease-in-out">
                                        <img src={org.avatar_url} alt={org.login} className="w-12 h-12 rounded-full border border-gray-400" />
                                        <div>
                                            <h3 className="text-lg font-semibold">{org.login}</h3>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Personal Projects Section */}
                    <div className="w-full max-w-4xl px-4">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FaArchive /> Personal Projects</h2>
                        <p className="text-gray-400 mb-4 text-base">Random experiments, Hackathon submissions, Game jams and more!</p>
                        <div className="grid grid-cols-1 gap-8">
                            {repos.map((repo, index) => (
                                <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo bg-white bg-opacity-10 backdrop-blur-lg border border-gray-300 rounded-lg p-6 shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 ease-in-out hover:opacity-100 block">
                                    <div className="flex justify-between items-start ">
                                        <div>
                                            <h3 className="text-md min-[400px]:text-2xl font-semibold">
                                                {repo.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">Built with: {languages[repo.id]?.join(", ") || "Loading..."}</p>
                                            <p className="text-left mt-4 text-sm min-[400px]:text-lg">{repo.description}</p>
                                        </div>
                                        <div className="flex gap-4 text-2xl">
                                            {repo.homepage && (
                                                <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                                                    <FaExternalLinkAlt className="hover:scale-125 transition-transform duration-300 ease-in-out" />
                                                </a>
                                            )}
                                            <FaGithub className="hover:scale-125 transition-transform duration-300 ease-in-out" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                    {repos.length > 0 && (
                        <div className="py-4">
                            <h3 className="text-center text-lg sm:text-xl font-semibold pt-8 pb-4">See more of my projects or reach out:</h3>
                            <Logos />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProjectFetcher;