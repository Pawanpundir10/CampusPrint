const Spinner = ({ size="md", color="border-orange-500" }) => {
  const s = { sm:"w-4 h-4", md:"w-7 h-7", lg:"w-12 h-12" }[size];
  return <div className={`${s} ${color} border-2 border-t-transparent rounded-full anim-spin`} />;
};
export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAFAF8]">
    <Spinner size="lg" />
    <p className="text-gray-400 text-sm">Loading...</p>
  </div>
);
export default Spinner;
