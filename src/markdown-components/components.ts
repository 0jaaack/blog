import Heading1 from "./Heading1.astro";
import Heading2 from "./Heading2.astro";
import Heading3 from "./Heading3.astro";
import Heading4 from "./Heading4.astro";
import Paragraph from "./Paragraph.astro";
import UnorderedList from "./UnorderedList.astro";
import OrderedList from "./OrderedList.astro";
import ListItem from "./ListItem.astro";
import Link from "./Link.astro";

const components = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  a: Link,
};

export default components;
