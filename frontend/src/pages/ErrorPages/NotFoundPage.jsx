import { useNavigate } from 'react-router-dom';
import notFoundPage from '../../assets/notFoundPage.png';
import RootLayout from '../../layouts/RootLayout/RootLayout';
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <RootLayout>
      <div className="ErrorPage">
        <div className="ErrorPage_Content">
          <img src={notFoundPage} />
          <div>
            OOPs... Chúng mình không tìm thấy trang web bạn yêu cầu. Mình trở
            lại nhé...
          </div>
          <button
            onClick={() => {
              navigate('/');
            }}
            className="button-standard-1"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </RootLayout>
  );
}
