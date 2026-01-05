import { frontendApi } from '@/api/frontendApi';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';

export default function TermAndConditionPage() {
  const location = useLocation();
  useEffect(() => {
    console.log('l: ', location);
  }, [location]);

  const getFrontendPage = async (frontendPage) => {
    try {
      const response = await frontendApi.getFrontendPage(frontendPage);
      setMarkdown(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu');
    }
  };
  useEffect(() => {
    getFrontendPage(location.pathname);
  }, [location.pathname]);
  const [markdown, setMarkdown] = useState('');
  return (
    <div className="markdown-compact w-full h-full px-20 py-0">
      <MDEditor.Markdown source={markdown} />
    </div>
  );
}
