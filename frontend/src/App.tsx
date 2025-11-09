import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MantineProvider, AppShell, Burger, Group, NavLink } from '@mantine/core';
import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { Calendar, Users, Tag, Home, MapPin, Sun, Moon } from 'lucide-react';
import { EventsListPage } from './pages/EventsListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventFormPage } from './pages/EventFormPage';
import { ParticipantsListPage } from './pages/ParticipantsListPage';
import { ParticipantDetailPage } from './pages/ParticipantDetailPage';
import { TagsManagementPage } from './pages/TagsManagementPage';
import { EventsMapPage } from './pages/EventsMapPage';

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      radius="xl"
      color={computedColorScheme === 'dark' ? 'yellow' : 'blue'}
      onClick={() =>
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
      }
      aria-label="Toggle color scheme"
    >
      {computedColorScheme === 'dark' ? (
        <Sun size={18} strokeWidth={1.75} />
      ) : (
        <Moon size={18} strokeWidth={1.75} />
      )}
    </ActionIcon>
  );
}

function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const isMapRoute = location.pathname.startsWith('/events/map');
  const isEventsRoute = location.pathname.startsWith('/events') && !isMapRoute;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header style={{ zIndex: 2100 }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Calendar size={28} />
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              EventHub
            </span>
          </Group>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Events"
          leftSection={<Home size={20} />}
          active={isEventsRoute}
          onClick={() => {
            navigate('/events');
            close();
          }}
        />
        <NavLink
          label="Participants"
          leftSection={<Users size={20} />}
          active={location.pathname.startsWith('/participants')}
          onClick={() => {
            navigate('/participants');
            close();
          }}
        />
        <NavLink
          label="Tags"
          leftSection={<Tag size={20} />}
          active={location.pathname.startsWith('/tags')}
          onClick={() => {
            navigate('/tags');
            close();
          }}
        />
        <NavLink
          label="Map"
          leftSection={<MapPin size={20} />}
          active={isMapRoute}
          onClick={() => {
            navigate('/events/map');
            close();
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/new" element={<EventFormPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<EventFormPage />} />
          <Route path="/events/map" element={<EventsMapPage />} />
          <Route path="/participants" element={<ParticipantsListPage />} />
          <Route path="/participants/:id" element={<ParticipantDetailPage />} />
          <Route path="/tags" element={<TagsManagementPage />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

function App() {
  return (
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        primaryColor: 'blue',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      <Notifications position="top-right" zIndex={2200} />
      <Router>
        <AppLayout />
      </Router>
    </MantineProvider>
  );
}

export default App;
