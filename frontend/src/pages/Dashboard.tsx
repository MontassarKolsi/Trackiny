import Navbar from "../components/Navbar";
import { useGithubDashboard } from "../hooks/useGithubDashboard";

export default function Dashboard() {

  const {
    data,
    isLoading,
    error,
  } = useGithubDashboard();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="p-10">
          Loading...
        </div>
      </>
    );
  }

  if (error) {

    return (
      <>
        <Navbar />

        <div className="p-10">

          <h1 className="text-3xl font-bold mb-4">
            Welcome to Trackiny
          </h1>

          <p className="mb-6">
            You haven't connected GitHub yet.
          </p>

          <a
            href="http://localhost:3000/github/connect"
            className="rounded bg-black px-6 py-3 text-white"
          >
            Connect GitHub
          </a>

        </div>
      </>
    );
  }

  return (

    <>
      <Navbar />

      <div className="mx-auto max-w-5xl p-10">

        <div className="flex gap-6 items-center">

          <img
            src={data.github.avatar}
            className="w-28 h-28 rounded-full"
          />

          <div>

            <h1 className="text-3xl font-bold">
              {data.github.name}
            </h1>

            <p>
              @{data.github.username}
            </p>

            <a
              href={data.github.profileUrl}
              target="_blank"
            >
              View GitHub
            </a>

          </div>

        </div>

        <div className="grid grid-cols-4 gap-6 mt-10">

          <div className="rounded-lg border p-6">
            <h3>Repositories</h3>

            <p className="text-3xl font-bold">
              {data.github.repositories}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3>Followers</h3>

            <p className="text-3xl font-bold">
              {data.github.followers}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3>Following</h3>

            <p className="text-3xl font-bold">
              {data.github.following}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3>Contributions</h3>

            <p className="text-3xl font-bold">
              {data.github.totalContributions}
            </p>
          </div>

        </div>

      </div>

    </>

  );
}