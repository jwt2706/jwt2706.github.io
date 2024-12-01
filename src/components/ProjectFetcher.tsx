import React, { useEffect, useState } from "react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface Repo {
    id: number;
    name: string;
    html_url: string;
    description: string;
    homepage: string;
    languages_url: string;
    created_at: string;
}

const ProjectFetcher: React.FC = () => {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [languages, setLanguages] = useState<{ [key: number]: string[] }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("https://api.github.com/users/jwt2706/repos")
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
            })
            .catch((error) => {
                console.error("Error fetching repos:", error);
                setError(error.message);
            });
    }, []);

    return (
        <div className="flex flex-col items-center">
            {error ? (
                <p className="text-red-500">There was a problem fetching the repositories: {error}</p>
            ) : (
                <div className="flex flex-col gap-5 w-full max-w-2xl">
                    {repos.map((repo) => (
                        <div key={repo.id} className="repo border border-gray-300 rounded-lg p-4 shadow-lg transition-transform transform hover:-translate-y-1 bg-white">
                            <h3 className="text-xl font-semibold">
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {repo.name}
                                </a>
                            </h3>
                            <p className="mt-2">{repo.description}</p>
                            <div className="repo-links flex gap-3 mt-3">
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                    <FaGithub /> GitHub
                                </a>
                                {repo.homepage && (
                                    <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                        <FaExternalLinkAlt /> View Project
                                    </a>
                                )}
                            </div>
                            <p className="mt-2">Languages: {languages[repo.id]?.join(", ") || "Loading..."}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectFetcher;