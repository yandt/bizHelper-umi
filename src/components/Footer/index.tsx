import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

const Footer: React.FC = () => {
  const defaultMessage = 'Management production';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'Car insurance system',
          title: <><GithubOutlined /> GitHub</>,
          href: 'https://github.com/yandt',
          blankTarget: true,
        }
      ]}
    />
  );
};

export default Footer;
