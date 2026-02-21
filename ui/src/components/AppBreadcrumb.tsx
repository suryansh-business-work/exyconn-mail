import React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppBreadcrumbProps {
  items: BreadcrumbItem[];
}

const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ items }) => {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast || !item.href ? (
          <Typography key={item.label} color="text.primary" fontWeight={isLast ? 600 : 400}>
            {item.label}
          </Typography>
        ) : (
          <MuiLink
            key={item.label}
            component={Link}
            to={item.href}
            underline="hover"
            color="inherit"
          >
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
};

export default AppBreadcrumb;
