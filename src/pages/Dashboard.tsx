import { useAuthStore } from "../store/useAuthStore";

export default function Dashboard() {
    const { isAuthenticated } = useAuthStore();
  const msg =  isAuthenticated? "Logged":"NotL"
  return (
    <div>
      <h1 className="text-3xl font-bold">
        {msg}
      </h1>
    </div>
  );
}