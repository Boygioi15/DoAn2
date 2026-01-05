import { useNavigate } from "react-router-dom";
import notFoundPage from "../assets/notFoundPage.png";
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-25">
      <div className=" flex flex-col items-center gap-5 text-[20px] leading-8 text-center">
        <img src={notFoundPage} />
        <div>OOPs... Chúng mình không tìm thấy trang web bạn yêu cầu.</div>
      </div>
    </div>
  );
}
