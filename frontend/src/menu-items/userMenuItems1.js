// assets
import { IconDashboard } from '@tabler/icons';

// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const userMenuItems1 = {
  id: 'userMenuItems',
  title: 'User Menu Items',
  type: 'group',
  children: [
    // {
    //   id: 'accountInformation',
    //   title: 'Account Information',
    //   type: 'item',
    //   url: '/free/new-submission',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'accountDetails',
    //   title: 'Account Details',
    //   type: 'item',
    //   url: '/free/new-submission',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    {
      id: 'heraldForm',
      title: 'Herald Form',
      type: 'item',
      url: '/new-submission',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },

  ]
};

export default userMenuItems1;
